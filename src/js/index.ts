import { setExtensionSize } from './setExtensionSize.js';
import { initEditor } from './initEditor.js';
import { selectors } from './selectors.js';
import { processSass } from './processSass.js';
import { elementChangeWatcher, loadSass } from './loadSass.js';
import { newSassInit } from './newSass.js';

document.addEventListener('DOMContentLoaded', () => {
  window.SASS_EDITMODE = 'new';
  window.SASS_LOADED_EL = null;

  setExtensionSize();
  initEditor();
  elementChangeWatcher();
});

// on save
document
  .getElementById(selectors.FORM_ID)
  .addEventListener('submit', async (event) => {
    event.preventDefault();
    processSass();
  });

// on existing document load
document
  .getElementById(selectors.SASS_LOAD_BUTTON_ID)
  .addEventListener('click', async (event) => {
    event.preventDefault();
    loadSass();
  });

// set listeners on newfile
document
  .getElementById(selectors.SASS_NEWFILE_INIT_ID)
  .addEventListener('click', async (event) => {
    event.preventDefault();
    event.stopPropagation();

    newSassInit();
  });
