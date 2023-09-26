import { getFilenameInputEl } from './filename.js';
import { getNewEditorState } from './initEditor.js';
import { selectors } from './selectors.js';

export function newSassInit() {
  const newSassInitEl = document.getElementById(selectors.SASS_NEWFILE_INIT_ID);
  const newSassConfirmEl = document.getElementById(
    selectors.SASS_NEWFILE_CONFIRM_ID
  );

  newSassInitEl.style.display = 'none';
  newSassConfirmEl.style.display = 'block';

  newSassConfirmEl.addEventListener('click', processNewSassConfirm);

  document.body.addEventListener(
    'click',
    () => {
      document.removeEventListener('click', processNewSassConfirm);
      resetInitLinksDisplay();
    },
    { once: true }
  );

  function processNewSassConfirm() {
    setupNewSass();
    resetInitLinksDisplay();
  }

  function resetInitLinksDisplay() {
    newSassInitEl.style.display = 'block';
    newSassConfirmEl.style.display = 'none';
  }
}

export function setupNewSass() {
  window.SASS_EDITMODE = 'new';
  window.SASS_LOADED_EL = null;

  const filenameEl = getFilenameInputEl();
  filenameEl.value = '';

  window.CODEMIRROR_INSTANCE.setState(getNewEditorState());
}
