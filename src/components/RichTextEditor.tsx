import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  LinkIcon,
  Undo2,
  Redo2,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Rich text editor component using Tiptap
 * Features:
 * - Bold, italic, heading (h1, h2)
 * - Bullet and ordered lists
 * - Blockquotes
 * - Links
 * - Undo/Redo
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [content, setContent] = useState('');
 *   return (
 *     <RichTextEditor
 *       value={content}
 *       onChange={setContent}
 *       placeholder="Enter text..."
 *     />
 *   );
 * }
 * ```
 */
export function RichTextEditor({
  value,
  onChange,
  className = '',
}: RichTextEditorProps): React.ReactElement {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: 'text-base leading-relaxed',
          },
        },
        heading: {
          levels: [1, 2],
        },
      }),
      Link.configure({
        openOnClick: false,
        linkOnPaste: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const buttonClass =
    'p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors';
  const activeButtonClass = 'bg-slate-200 dark:bg-slate-700';

  if (!editor) {
    return <div className="min-h-[200px] bg-slate-100 rounded animate-pulse" />;
  }

  return (
    <div className={`border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        {/* Bold */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${buttonClass} ${editor.isActive('bold') ? activeButtonClass : ''}`}
          title="Bold (Ctrl+B)"
          type="button"
        >
          <Bold size={18} />
        </button>

        {/* Italic */}
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${buttonClass} ${editor.isActive('italic') ? activeButtonClass : ''}`}
          title="Italic (Ctrl+I)"
          type="button"
        >
          <Italic size={18} />
        </button>

        <div className="w-px bg-slate-300 dark:bg-slate-600" />

        {/* Heading 1 */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`${buttonClass} ${editor.isActive('heading', { level: 1 }) ? activeButtonClass : ''}`}
          title="Heading 1"
          type="button"
        >
          <Heading1 size={18} />
        </button>

        {/* Heading 2 */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`${buttonClass} ${editor.isActive('heading', { level: 2 }) ? activeButtonClass : ''}`}
          title="Heading 2"
          type="button"
        >
          <Heading2 size={18} />
        </button>

        <div className="w-px bg-slate-300 dark:bg-slate-600" />

        {/* Bullet List */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${buttonClass} ${editor.isActive('bulletList') ? activeButtonClass : ''}`}
          title="Bullet List"
          type="button"
        >
          <List size={18} />
        </button>

        {/* Ordered List */}
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${buttonClass} ${editor.isActive('orderedList') ? activeButtonClass : ''}`}
          title="Ordered List"
          type="button"
        >
          <ListOrdered size={18} />
        </button>

        {/* Blockquote */}
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`${buttonClass} ${editor.isActive('blockquote') ? activeButtonClass : ''}`}
          title="Quote"
          type="button"
        >
          <Quote size={18} />
        </button>

        <div className="w-px bg-slate-300 dark:bg-slate-600" />

        {/* Link */}
        <button
          onClick={() => {
            const url = prompt('Enter URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={`${buttonClass} ${editor.isActive('link') ? activeButtonClass : ''}`}
          title="Link"
          type="button"
        >
          <LinkIcon size={18} />
        </button>

        <div className="w-px bg-slate-300 dark:bg-slate-600" />

        {/* Undo */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className={`${buttonClass} disabled:opacity-50 disabled:cursor-not-allowed`}
          title="Undo"
          type="button"
        >
          <Undo2 size={18} />
        </button>

        {/* Redo */}
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className={`${buttonClass} disabled:opacity-50 disabled:cursor-not-allowed`}
          title="Redo"
          type="button"
        >
          <Redo2 size={18} />
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="prose dark:prose-invert prose-sm max-w-none p-4 focus:outline-none min-h-[200px]"
      />
    </div>
  );
}
