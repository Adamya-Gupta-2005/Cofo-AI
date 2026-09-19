import { useEffect, useRef } from 'react';

export const useSSE = (transformationId, onEvent, enabled = true) => {
  const eventSourceRef = useRef(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!transformationId || !enabled) return;

    const sseUrl = `/api/v1/transformations/${transformationId}/progress`;
    const eventSource = new EventSource(sseUrl, { withCredentials: true });
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (onEventRef.current) {
          onEventRef.current(parsed);
        }
        if (parsed.type === 'complete') {
          eventSource.close();
        }
      } catch (err) {
        console.error('[SSE] Failed to parse event payload:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn('[SSE] EventSource encountered error/closed:', err);
      eventSource.close();
    };

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [transformationId, enabled]);
};
