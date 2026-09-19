import { create } from 'zustand';

export const useUIStore = create((set) => ({
  validationModalOpen: false,
  selectedValidationReport: null,
  editorModalOpen: false,
  selectedOutputForEdit: null,

  openValidationModal: (report) =>
    set({
      validationModalOpen: true,
      selectedValidationReport: report,
    }),
  closeValidationModal: () =>
    set({
      validationModalOpen: false,
      selectedValidationReport: null,
    }),

  openEditorModal: (output) =>
    set({
      editorModalOpen: true,
      selectedOutputForEdit: output,
    }),
  closeEditorModal: () =>
    set({
      editorModalOpen: false,
      selectedOutputForEdit: null,
    }),
}));
