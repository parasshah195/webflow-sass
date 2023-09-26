import { setExtensionSize } from './js/setExtensionSize.js';
import { initEditor } from './js/initEditor.js';
import { selectors } from './js/selectors.js';
import { processSass } from './js/processSass.js';

document.addEventListener('DOMContentLoaded', () => {
  setExtensionSize();
  initEditor();
});

// TODO: differentiate between existing and new element load
// TODO: detect mode of whether it's loaded from an existing Sass element or we are creating a new element instance
document
  .getElementById(selectors.FORM_ID)
  .addEventListener('submit', async (event) => {
    event.preventDefault();
    processSass();
  });
