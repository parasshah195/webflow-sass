import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { sass } from '@codemirror/lang-sass';

const SASS_EDITOR_ID = 'sass-editor';
const SASS_LOAD_BUTTON_ID = 'editor-load-sass';
const SASS_SAVE_BUTTON_ID = 'editor-save-sass';

let CODEMIRROR_INSTANCE;

document.addEventListener('DOMContentLoaded', () => {
  setExtensionSize();
  loadEditor();
});

async function setExtensionSize() {
  // Set a vertically oriented window height, since it's a code editor app.
  await webflow.setExtensionSize({ width: 500, height: 1080 });
}

function loadEditor() {
  const initialState = EditorState.create({
    doc: '',
    extensions: [basicSetup, sass(), oneDark],
  });

  CODEMIRROR_INSTANCE = new EditorView({
    parent: document.getElementById(SASS_EDITOR_ID),
    state: initialState,
  });
}

document.getElementById(SASS_SAVE_BUTTON_ID).onsubmit = async (event) => {
  event.preventDefault();

  // const el = await webflow.getSelectedElement();
  // if (el && el.textContent) {
  //   el.setTextContent(
  //     'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do ' +
  //       'eiusmod tempor incididunt ut labore et dolore magna aliqua.'
  //   );
  //   el.save();
  // }
};
