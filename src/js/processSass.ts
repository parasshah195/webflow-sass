import * as sassLang from 'sass';
import { showWebflowError } from './showWebflowError.js';
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

  const compiledCode = await getCSSFromEditorSass();
  if (!compiledCode) {
    return;
  }

  // set scss
  sassEl.setTextContent(compiledCode.sass);
  await sassEl.save();

  const cssDomId = getCssDomId(sassEl);

  // set css
  if (!cssDomId) {
    const currentEl = await webflow.getSelectedElement();
    if ('DOM' === currentEl.type && 'template' === currentEl.getTag()) {
      await showWebflowError(
        'Unable to find the previous CSS Element. Please select parent element which has SASS element and then save again to generate new CSS element'
      );
      return;
    } else {
      if (!currentEl.children) {
        await showWebflowError(
          'Please select the correct parent which can have a child CSS element'
        );
        return;
      }

      const filenames = getFilenamesWithExtension(filenameInput);
      const newCSSEl = await createNewCSSEl(compiledCode.css, filenames.css);

      if (sassEl.customAttributes) {
        sassEl.setCustomAttribute(selectors.CSS_DOM_ID_ATTRIBUTE, newCSSEl.id);
      }

      const currentSelectedElChildren = currentEl.getChildren();
      currentEl.setChildren([...currentSelectedElChildren, newCSSEl]);

      await currentEl.save();
    }
  } else {
    // find the CSS element and update
    const allElements = await webflow.getAllElements();
    const currentCssEl = allElements.find((el) => el.id === cssDomId.domID);

    if (!currentCssEl) {
      await showWebflowError(
        'Unable to find the correct CSS element for this Sass element'
      );
      return;
    }

    if (!currentCssEl.children || !currentCssEl.textContent) {
      await showWebflowError(
        'Error updating compiled CSS for the Sass. Please copy your Sass code and create new Sass files'
      );
      return;
    }

    currentCssEl.setTextContent(compiledCode.css);
    await currentCssEl.save();
  }
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

    const currentSelectedElChildren = selectedEl.getChildren();
    selectedEl.setChildren([...currentSelectedElChildren, newSassEl, newCSSEl]);
    await selectedEl.save();

    // change mode to continue updating the same Sass and CSS files.
    window.SASS_EDITMODE = 'load';
    window.SASS_LOADED_EL = selectedEl;
  } catch (err) {
    console.error(err);
    await showWebflowError('Unknown error on adding Sass and generated CSS');
    await showWebflowError(
      'Please check browser console and report to the developer from the credits link.'
    );
    return;
  }
}

async function createNewSassEl(
  compiledSass: string,
  sassFilename: string
): Promise<DOMElement> {
  const newSassEl = webflow.createDOM('template');
  const newSassStringEl = webflow.createString(compiledSass);
  newSassEl.setChildren([newSassStringEl]);
  await addStyle(sassFilename, newSassEl);

  return newSassEl;
}

async function createNewCSSEl(
  compiledCSS: string,
  cssFilename: string
): Promise<DOMElement> {
  const newCSSEl = webflow.createDOM('style');
  const newCSSStringEl = webflow.createString(compiledCSS);
  newCSSEl.setChildren([newCSSStringEl]);
  await addStyle(cssFilename, newCSSEl);

  return newCSSEl;
}

/**
 * Creates a new class if doesn't exist or directly adds it
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
    const sassCompiled = await sassLang.compileStringAsync(sassCode, {
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
