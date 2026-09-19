import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Save,
} from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { outputApi } from '../../api/output.api.js';
import toast from 'react-hot-toast';

export const OutputEditor = ({
  isOpen,
  onClose,
  output,
  onSaveSuccess,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Edit transformed content here...',
      }),
    ],
    content: output?.renderedText || '',
  });

  useEffect(() => {
    if (editor && output) {
      editor.commands.setContent(output.renderedText || '');
    }
  }, [editor, output]);

  if (!output) return null;

  const handleSave = async () => {
    if (!editor) return;
    try {
      setIsSaving(true);
      const updatedText = editor.getText();
      const res = await outputApi.updateOutput(output._id, {
        renderedText: updatedText,
      });
      toast.success(`Updated version ${res.data.output.version} saved`);
      if (onSaveSuccess) {
        onSaveSuccess(res.data.output);
      }
      onClose();
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Output Content — ${output.outputType.toUpperCase()} (v${output.version || 1})`}
      maxWidth="max-w-4xl"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={Save}
            isLoading={isSaving}
            onClick={handleSave}
          >
            Save Revision
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {/* Editor Toolbar */}
        {editor && (
          <div className="flex items-center gap-1 p-2 bg-slate-100 rounded-input border border-slate-200">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${
                editor.isActive('bold') ? 'bg-slate-200 text-blue-600' : 'text-slate-700'
              }`}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${
                editor.isActive('italic') ? 'bg-slate-200 text-blue-600' : 'text-slate-700'
              }`}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-slate-300 mx-1" />
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${
                editor.isActive('heading', { level: 1 }) ? 'bg-slate-200 text-blue-600' : 'text-slate-700'
              }`}
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${
                editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 text-blue-600' : 'text-slate-700'
              }`}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-slate-300 mx-1" />
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${
                editor.isActive('bulletList') ? 'bg-slate-200 text-blue-600' : 'text-slate-700'
              }`}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${
                editor.isActive('orderedList') ? 'bg-slate-200 text-blue-600' : 'text-slate-700'
              }`}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Editor Content Area */}
        <div className="border border-slate-200 rounded-input p-4 min-h-[300px] max-h-[450px] overflow-y-auto bg-white font-sans text-sm">
          <EditorContent editor={editor} />
        </div>

        <div className="text-[11px] text-slate-500">
          * Saving increments the document version and automatically triggers deterministic fact validation against the canonical knowledge model.
        </div>
      </div>
    </Modal>
  );
};
