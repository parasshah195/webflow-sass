import { getFilenameInputEl, removeFilenameExtension } from './filename.js';
import { getNewEditorState } from './initEditor.js';
import { selectors } from './selectors.js';
import { showWebflowError } from './webflowNotify.js';
import { format } from 'prettier/standalone';
import parserPostcss from 'prettier/parser-postcss';

// can potentially use prettier, like how string.is does - https://github.com/recurser/string-is/blob/develop/src/lib/outputs/CssOutput.ts
export async function loadSass() {
  window.SASS_EDITMODE = 'load';

  const sassEl = (await webflow.getSelectedElement()) as DOMElement;
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
  const formattedSass = await format(currentSassContent, {
    parser: 'scss',
    plugins: [parserPostcss],
  });
  window.CODEMIRROR_INSTANCE.setState(getNewEditorState(formattedSass));
}
