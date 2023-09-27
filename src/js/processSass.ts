// note: sass module is huge, calculating to ~3MB in minified size
import {compileStringAsync as sassAsyncCompile} from 'sass';

import { showWebflowError, showWebflowSuccessfulSave } from './webflowNotify.js';
import { getFilenameInputEl, getFilenamesWithExtension } from './filename.js';
import { selectors } from './selectors.js';
import { getCssDomId } from './getCssDomId.js';

let filenameInput: HTMLInputElement;

interface ProcessedCode {
  sass: string;
  css: string;
}

/**
 * Note: `setTextContent` method is used to set the content, and el.getChildren()[0].getText() is used to fetch content. Seems to be the same thing
 */

export async function processSass() {
  filenameInput = getFilenameInputEl();

  if (!filenameInput || '' === filenameInput.value) {
    await showWebflowError('Please enter a filename');
    return;
  }

  if ('new' === window.SASS_EDITMODE) {
    createNewSassDOM();
  } else {
    updateSass();
  }
}

export async function updateSass() {
  if (!window.SASS_LOADED_EL) {
    console.error(
      'Unable to locate current Sass DOM element on save. Creating a new one'
    );
    createNewSassDOM();
    return;
  }

  const sassEl = window.SASS_LOADED_EL;

  if (!sassEl.textContent) {
    await showWebflowError(
      'Unable to update the current Sass element. Please copy the Sass code, clear the editor, and create a new Sass element'
    );
    return;
  }

  const filenames = getFilenamesWithExtension(filenameInput);

  const compiledCode = await getCSSFromEditorSass();
  if (!compiledCode) {
    return;
  }

  // set scss
  sassEl.setTextContent(compiledCode.sass);
  await addStyle(filenames.scss, sassEl);
  await sassEl.save();

  const cssDomId = getCssDomId(sassEl);
  const currentSelectedEl = await webflow.getSelectedElement();

  // set css
  if (!cssDomId) {
    if (
      'DOM' === currentSelectedEl.type &&
      'template' === currentSelectedEl.getTag()
    ) {
      await showWebflowError(
        'Unable to find the previous CSS Element. Please select parent element which has SASS element and then save again to generate new CSS element'
      );
      return;
    } else {
      createNewCSSElForSass(currentSelectedEl, sassEl, compiledCode.css);
      return;
    }
  } else {
    // find the CSS element and update
    const allElements = await webflow.getAllElements();
    const currentCssEl = allElements.find((el) => el.id === cssDomId.domID);

    if (!currentCssEl) {
      createNewCSSElForSass(currentSelectedEl, sassEl, compiledCode.css);
      return;
    }

    if (!currentCssEl.children || !currentCssEl.textContent) {
      await showWebflowError(
        'Error updating compiled CSS for the Sass. Please copy your Sass code and create new Sass files'
      );
      return;
    }

    currentCssEl.setTextContent(compiledCode.css);
    await addStyle(filenames.css, currentCssEl);
    await currentCssEl.save();
  }

  await showWebflowSuccessfulSave();
}

export async function createNewSassDOM() {
  const selectedEl = await webflow.getSelectedElement();
  if (!selectedEl) {
    await showWebflowError(
      'Select a wrapper element to nest the Sass and CSS code'
    );
    return;
  }

  if (!selectedEl.children) {
    await showWebflowError(
      'The selected element cannot have Sass styling nested inside. Please select another element'
    );
    return;
  }

  if (
    'DOM' === selectedEl.type &&
    ('template' === selectedEl.getTag() || 'style' === selectedEl.getTag())
  ) {
    await showWebflowError(
      "Can't overwrite CSS on the selected element. Please choose another parent to nest the CSS"
    );
    return;
  }

  const compiledCode = await getCSSFromEditorSass();
  if (!compiledCode) {
    return;
  }

  // add it as a new element
  const filenames = getFilenamesWithExtension(filenameInput);

  try {
    const newSassEl = await createNewSassEl(compiledCode.sass, filenames.scss);
    const newCSSEl = await createNewCSSEl(compiledCode.css, filenames.css);

    newSassEl.setAttribute(selectors.CSS_DOM_ID_ATTRIBUTE, newCSSEl.id);

    const currentSelectedElChildren = selectedEl.getChildren();
    selectedEl.setChildren([...currentSelectedElChildren, newSassEl, newCSSEl]);
    await selectedEl.save();

    // change mode to continue updating the same Sass and CSS files.
    window.SASS_EDITMODE = 'load';
    window.SASS_LOADED_EL = newSassEl;
  } catch (err) {
    console.error(err);
    await showWebflowError('Unknown error on adding Sass and generated CSS');
    await showWebflowError(
      'Please check browser console and report to the developer from the credits link.'
    );
    return;
  }

  await showWebflowSuccessfulSave();
}

async function createNewSassEl(
  compiledSass: string,
  sassFilename: string
): Promise<DOMElement> {
  const newSassEl = webflow.createDOM('template');
  newSassEl.setTextContent(compiledSass);
  // const newSassStringEl = webflow.createString(compiledSass);
  // newSassEl.setChildren([newSassStringEl]);
  await addStyle(sassFilename, newSassEl);

  return newSassEl;
}

async function createNewCSSEl(
  compiledCSS: string,
  cssFilename: string
): Promise<DOMElement> {
  const newCSSEl = webflow.createDOM('style');
  newCSSEl.setTextContent(compiledCSS);
  // const newCSSStringEl = webflow.createString(compiledCSS);
  // newCSSEl.setChildren([newCSSStringEl]);
  await addStyle(cssFilename, newCSSEl);

  return newCSSEl;
}

/**
 * Creates a new class if doesn't exist or directly adds it
 * Replaces any existing classes on the element
 * @param className Class name to be added
 * @param webflowEl The webflow element on which the class has to be added
 * @returns
 */
async function addStyle(className, webflowEl) {
  try {
    let style = await webflow.getStyleByName(className);

    if (!style) {
      style = webflow.createStyle(className);
      await style.save();
    }

    webflowEl.setStyles([style]);
  } catch (err) {
    await showWebflowError((err as Error).message);
    return;
  }
}

/**
 * Get Sass from editor and compile it to CSS
 * Shows Weblow errors when required
 */
async function getCSSFromEditorSass(): Promise<ProcessedCode | false> {
  const sassCode = window.CODEMIRROR_INSTANCE.state.doc
    .toString()
    .replace(/[\n\r]/g, '');

  if (!sassCode || '' === sassCode) {
    await showWebflowError("Can't save an empty document");
    return false;
  }

  let compiledCSS = '';

  // run sass lib on it, error check
  try {
    const sassCompiled = await sassAsyncCompile(sassCode, {
      style: 'compressed',
      quietDeps: true,
    });

    compiledCSS = sassCompiled.css;
  } catch (err) {
    await showWebflowError((err as Error).message);
    console.error(err);
    return false;
  }

  return {
    sass: sassCode,
    css: compiledCSS,
  };
}

/**
 * Generates a new CSS element for an existing Sass. Updates its CSS DOM ID attribute
 * @param currentEl The webflow element to nest the CSS element within
 * @param sassEl The Sass el for which the CSS element is being created
 * @param compiledCSS The compiled CSS String
 * @returns
 */
async function createNewCSSElForSass(
  currentEl: AnyElement,
  sassEl: DOMElement,
  compiledCSS: string
) {
  if (
    !currentEl.children ||
    ('DOM' === currentEl.type && 'template' === currentEl.getTag())
  ) {
    await showWebflowError(
      'Please select the correct parent element which has the scss element'
    );
    return;
  }

  const filenames = getFilenamesWithExtension(filenameInput);
  const newCSSEl = await createNewCSSEl(compiledCSS, filenames.css);

  sassEl.setAttribute(selectors.CSS_DOM_ID_ATTRIBUTE, newCSSEl.id);
  await sassEl.save();

  const currentSelectedElChildren = currentEl.getChildren();
  currentEl.setChildren([...currentSelectedElChildren, newCSSEl]);

  await currentEl.save();
}
