import type { EditorView } from 'codemirror';

declare global {
  interface Window {
    CODEMIRROR_INSTANCE: EditorView;
  }
}
