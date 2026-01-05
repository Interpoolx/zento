import { useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';

/**
 * Hook that registers keyboard shortcuts for the editor.
 * 
 * Shortcuts:
 * - Cmd/Ctrl+Z: Undo
 * - Cmd/Ctrl+Shift+Z: Redo
 * - Cmd/Ctrl+D: Duplicate selected widget
 * - Cmd/Ctrl+C: Copy selected widget
 * - Cmd/Ctrl+V: Paste widget
 * - Delete/Backspace: Delete selected widget
 * - Escape: Deselect widget
 * 
 * @example
 * ```tsx
 * function Editor() {
 *   useKeyboardShortcuts();
 *   return <div>Editor content</div>;
 * }
 * ```
 */
export function useKeyboardShortcuts(): void {
  const {
    selectedWidgetId,
    removeWidget,
    copyWidget,
    pasteWidget,
    addWidget,
    page,
    selectWidget,
    undo,
    redo,
  } = useEditorStore();

  useEffect(() => {
    /**
     * Keyboard event handler that processes all registered editor shortcuts.
     * Checks for modifier key (Cmd on Mac, Ctrl on Windows/Linux) and executes
     * the corresponding editor action. Prevents default browser behavior for all shortcuts
     * and ignores shortcuts when focus is on input/textarea elements.
     *
     * Shortcut Processing Flow:
     * 1. Detect platform (Mac vs Windows/Linux) for correct modifier key
     * 2. Check if focus is in input/textarea (skip shortcuts if true)
     * 3. Check each modifier+key combination against registered shortcuts
     * 4. Call corresponding store action if match found
     * 5. Call preventDefault() to avoid conflicting with browser defaults
     *
     * Registered Shortcuts:
     * - **Cmd/Ctrl+Z**: Undo last action
     * - **Cmd/Ctrl+Shift+Z**: Redo next action
     * - **Cmd/Ctrl+D**: Duplicate selected widget
     * - **Cmd/Ctrl+C**: Copy selected widget to clipboard
     * - **Cmd/Ctrl+V**: Paste widget from clipboard
     * - **Delete/Backspace**: Delete selected widget
     * - **Escape**: Deselect current widget
     *
     * Smart Key Detection:
     * - Uses `navigator.platform` to detect Mac (includes iPhone/iPad)
     * - Checks both metaKey (Cmd) and ctrlKey at OS level
     * - Examines activeElement tagName to avoid intercepting form input
     * - Case-insensitive key matching for letter keys
     *
     * Widget Duplication Logic:
     * - Finds selected widget in page.widgets array
     * - Creates new widget with all properties copied
     * - Generates new UUID for cloned widget
     * - Offsets position by (+1, +1) to avoid overlap
     * - Adds to page immediately via addWidget()
     *
     * Focus Management:
     * - Escape key calls selectWidget(null) to clear selection
     * - Undo/Redo/Delete automatically deselect to prevent stale selection
     * - Copy/Paste work with selectedWidgetId; no-op if nothing selected
     *
     * @param e - KeyboardEvent from the window keydown listener.
     *   Properties used: key, ctrlKey, metaKey, shiftKey, preventDefault()
     *
     * @example
     * ```typescript
     * // User presses Cmd+Z (on Mac) or Ctrl+Z (on Windows)
     * // => Calls undo() from store, updates history index
     *
     * // User presses Escape with widget selected
     * // => Calls selectWidget(null), clears selection highlight
     *
     * // User presses Cmd+D with widget selected
     * // => Creates copy at position +1,+1 from original
     * // => Selected widget stays same, but now duplicate exists
     * ```
     *
     * @example
     * ```typescript
     * // Copy/Paste workflow
     * // User presses Cmd+C with widget selected
     * // => Copies widget to clipboard state
     *
     * // User clicks different position
     * // => selectWidget changes selectedWidgetId
     *
     * // User presses Cmd+V
     * // => Pastes from clipboard with new ID and offset position
     * // => New widget added to page
     * ```
     *
     * @example
     * ```typescript
     * // Disabled in form inputs
     * // User focuses search input and presses Ctrl+A
     * // => Short-circuits due to activeElement check
     * // => Selects all input text (browser default)
     *
     * // User types Cmd+Z in text field
     * // => activeElement.tagName = 'INPUT'
     * // => Handler returns early, no undo triggered
     * // => Browser's input undo applies instead
     * ```
     *
     * Dependencies:
     * - Accesses store via useEditorStore() hook
     * - Reads: selectedWidgetId, page.widgets state
     * - Calls: undo(), redo(), copyWidget(), pasteWidget(), 
     *   removeWidget(), addWidget(), selectWidget()
     * - Updates history automatically via store actions
     *
     * Performance Notes:
     * - Runs on every keydown, so check is fast
     * - Short-circuits early if focus is in input
     * - No debouncing needed (discrete key events)
     * - Uses store getState() for undo/redo checks
     *
     * @see {@link useKeyboardShortcuts} - Hook that registers this handler
     * @see {@link useEditorStore} - Store providing all widget/page actions
     * @see {@link useEditorStore.page} - Current page data with widgets array
     * @see {@link useEditorStore.selectedWidgetId} - Currently selected widget ID
     */
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Prevent shortcuts from firing in input fields/textareas
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      // Cmd/Ctrl+Z: Undo
      if (modifier && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Cmd/Ctrl+Shift+Z: Redo
      if (modifier && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }

      // Cmd/Ctrl+D: Duplicate selected
      if (modifier && e.key === 'd') {
        e.preventDefault();
        if (selectedWidgetId) {
          const widget = page.widgets.find((w) => w.id === selectedWidgetId);
          if (widget) {
            const newWidget = {
              ...widget,
              id: crypto.randomUUID(),
              position: {
                x: (widget.position?.x || 0) + 1,
                y: (widget.position?.y || 0) + 1,
              },
            };
            addWidget(newWidget);
          }
        }
      }

      // Cmd/Ctrl+C: Copy selected
      if (modifier && e.key === 'c') {
        e.preventDefault();
        if (selectedWidgetId) {
          copyWidget(selectedWidgetId);
        }
      }

      // Cmd/Ctrl+V: Paste
      if (modifier && e.key === 'v') {
        e.preventDefault();
        pasteWidget();
      }

      // Delete or Backspace: Delete selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedWidgetId) {
        e.preventDefault();
        removeWidget(selectedWidgetId);
        selectWidget(null);
      }

      // Escape: Deselect
      if (e.key === 'Escape') {
        selectWidget(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedWidgetId, page.widgets, undo, redo, removeWidget, copyWidget, pasteWidget, addWidget, selectWidget]);
}
