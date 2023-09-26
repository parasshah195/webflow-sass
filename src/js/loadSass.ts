import { getFilenameInputEl, removeFilenameExtension } from './filename.js';
import { getNewEditorState } from './initEditor.js';
import { selectors } from './selectors.js';
import { showWebflowError } from './showWebflowError.js';

export async function loadSass() {
  window.SASS_EDITMODE = 'load';

  const sassEl = await webflow.getSelectedElement();
  if (!sassEl) {
    await showWebflowError('No element selected');
    return;
  }

  if (!sassEl.children) {
    await showWebflowError('No SCSS found on this element');
    return;
  }

  window.SASS_LOADED_EL = sassEl;

  let currentFileName = '';

  if (sassEl.styles) {
    const currentElStyles = await sassEl.getStyles();
    const currentFileNameWithExtn = currentElStyles[0].getName();
    currentFileName = removeFilenameExtension(currentFileNameWithExtn);
  }

  const filenameInput = getFilenameInputEl();
  if (filenameInput) {
    filenameInput.value = currentFileName;
  }

  const currentSassStringEl = sassEl.getChildren()[0];

  if ('String' !== currentSassStringEl.type) {
    await showWebflowError('No SCSS found on this element');
    return;
  }

  const currentSassContent = currentSassStringEl.getText();
  window.CODEMIRROR_INSTANCE.setState(getNewEditorState(currentSassContent));
}

/**
 * Updates state of Sass load button if the element is correctly identified as a custom Sass template
 */
export function elementChangeWatcher() {
  webflow.subscribe('selectedelement', (selectedEl) => {
    if (!selectedEl) {
      disableSassLoadButton();
      return;
    }

    if ('DOM' !== selectedEl.type) {
      disableSassLoadButton();
      return;
    }

    if ('template' !== selectedEl.getTag()) {
      disableSassLoadButton();
      return;
    }

    enableSassLoadButton();
  });
}

function disableSassLoadButton() {
  document
    .getElementById(selectors.SASS_LOAD_BUTTON_ID)
    .setAttribute('disabled', '');
}

function enableSassLoadButton() {
  document
    .getElementById(selectors.SASS_LOAD_BUTTON_ID)
    .removeAttribute('disabled');
}
