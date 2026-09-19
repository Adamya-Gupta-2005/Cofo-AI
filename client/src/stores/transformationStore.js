import { create } from 'zustand';

const initialProgress = {
  steps: {
    analyzing: 'idle', // 'idle' | 'running' | 'done' | 'error'
    building_prompt: 'idle',
    generating: 'idle',
    validating: 'idle',
  },
  messages: [],
  factCount: 0,
  isComplete: false,
  error: null,
};

export const useTransformationStore = create((set) => ({
  currentTransformation: null,
  currentSource: null,
  outputs: [],
  generationProgress: { ...initialProgress },

  setTransformation: (transformation) => set({ currentTransformation: transformation }),
  setSource: (source) => set({ currentSource: source }),
  setOutputs: (outputs) => set({ outputs }),

  updateOutput: (id, changes) =>
    set((state) => ({
      outputs: state.outputs.map((out) =>
        out._id === id ? { ...out, ...changes } : out
      ),
    })),

  updateProgress: (sseEvent) =>
    set((state) => {
      const progress = { ...state.generationProgress };

      if (sseEvent.type === 'step') {
        progress.steps = {
          ...progress.steps,
          [sseEvent.step]: sseEvent.status,
        };
        if (sseEvent.factCount !== undefined) {
          progress.factCount = sseEvent.factCount;
        }
        if (sseEvent.message) {
          progress.messages = [...progress.messages, sseEvent.message];
        }
      } else if (sseEvent.type === 'complete') {
        progress.isComplete = true;
      } else if (sseEvent.type === 'error') {
        progress.error = sseEvent.message;
      }

      return { generationProgress: progress };
    }),

  resetProgress: () => set({ generationProgress: { ...initialProgress } }),

  reset: () =>
    set({
      currentTransformation: null,
      currentSource: null,
      outputs: [],
      generationProgress: { ...initialProgress },
    }),
}));
