import { logger } from './logger.js';

const connections = new Map(); // transformationId -> Set of res objects

export const registerSSEConnection = (transformationId, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    'Access-Control-Allow-Credentials': 'true',
  });

  res.write('retry: 10000\n\n');

  if (!connections.has(transformationId)) {
    connections.set(transformationId, new Set());
  }
  connections.get(transformationId).add(res);
  logger.debug(`[SSE] Client registered for transformation: ${transformationId}`);

  res.on('close', () => {
    const set = connections.get(transformationId);
    if (set) {
      set.delete(res);
      if (set.size === 0) {
        connections.delete(transformationId);
      }
    }
    logger.debug(`[SSE] Client disconnected from transformation: ${transformationId}`);
  });
};

export const emitProgress = (transformationId, eventData) => {
  const set = connections.get(transformationId.toString());
  if (set && set.size > 0) {
    const payload = `data: ${JSON.stringify(eventData)}\n\n`;
    for (const res of set) {
      try {
        res.write(payload);
      } catch (err) {
        logger.error(`[SSE] Error writing to stream: ${err.message}`);
      }
    }
  }
};

export const emitComplete = (transformationId) => {
  emitProgress(transformationId, { type: 'complete', transformationId: transformationId.toString() });
  const set = connections.get(transformationId.toString());
  if (set) {
    for (const res of set) {
      try {
        res.end();
      } catch (err) {
        // ignore on end
      }
    }
    connections.delete(transformationId.toString());
  }
};
