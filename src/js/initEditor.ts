import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { sass as sassEditorLang } from '@codemirror/lang-sass';

import { selectors } from './selectors.js';

// TODO: allow "tab" key indentation inside the codemirror editor

export function initEditor() {
  const initialState = getNewEditorState();

  window.CODEMIRROR_INSTANCE = new EditorView({
    parent: document.getElementById(selectors.SASS_EDITOR_ID),
    state: initialState,
  });
}

export function getNewEditorState(initText = '') {
  return EditorState.create({
    doc: initText,
    extensions: [basicSetup, sassEditorLang(), oneDark],
  });
}
