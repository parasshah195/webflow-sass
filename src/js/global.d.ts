import type { EditorView } from 'codemirror';

declare global {
  interface Window {
    CODEMIRROR_INSTANCE: EditorView;
    /**
     * `new` for creating a new scss DOM element
     * `load` when loading an existing DOM file
     */
    SASS_EDITMODE: 'new' | 'load';
    SASS_LOADED_EL: null | AnyElement;
  }
}
