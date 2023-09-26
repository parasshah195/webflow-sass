import * as sassLang from 'sass';

import { showWebflowError } from './showWebflowError.js';

export async function processSass() {
  const filenameEl = document.getElementsByName(
    'filename'
  )[0] as HTMLInputElement;

  if (!filenameEl || '' === filenameEl.value) {
    await showWebflowError('Please enter a filename');
    return;
  }

  const selectedEl = await webflow.getSelectedElement();
  if (!selectedEl) {
    await showWebflowError(
      'Please select the existing Sass element to update or a parent div to add the new Sass styling to'
    );
    return;
  }

  if (!selectedEl.children) {
    await showWebflowError(
      'The selected element cannot have Sass styling nested inside. Please select another element'
    );
    return;
  }

  // TODO: return with error if selected element is of tag "style"
  // if sass template, then update it, else add a new one as a child; reject if it's a CSS <style> element created by the app

  // fetch data from editor
  const sassText = window.CODEMIRROR_INSTANCE.state.doc
    .toString()
    .replace(/[\n\r]/g, '');
  // const sassJSON = window.CODEMIRROR_INSTANCE.state.doc.toJSON();
  // const sassText = JSON.stringify(sassJSON);

  let compiledCSS = '';

  if (!sassText || '' === sassText) {
    await showWebflowError("Can't save an empty document");
    return;
  }
  // run sass lib on it, error check
  try {
    console.log(sassText);
    console.log(sassLang);

    const sassCompiled = await sassLang.compileStringAsync(sassText, {
      style: 'compressed',
      quietDeps: true,
    });

    compiledCSS = sassCompiled.css;
  } catch (err) {
    await showWebflowError(
      'Sass compilation failed. Check for any errors in your Sass code and/or browser console'
    );
    console.error(err);
    return;
  }

  // add it as a new element or update existing one

  const filenameSCSS = filenameEl.value + '.scss';
  const filenameCSS = filenameEl.value + '.css';

  try {
    const newSassEl = webflow.createDOM('template');
    newSassEl.setTextContent(sassText);
    const sassClass = webflow.createStyle(filenameSCSS);
    newSassEl.setStyles([sassClass]);

    const newCSSEl = webflow.createDOM('style');
    newCSSEl.setTextContent(compiledCSS);
    const CSSClass = webflow.createStyle(filenameCSS);
    newCSSEl.setStyles([CSSClass]);

    newSassEl.setAttribute('css-el-id', newCSSEl.id);

    const currentSelectedElChildren = selectedEl.getChildren();
    selectedEl.setChildren([...currentSelectedElChildren, newSassEl, newCSSEl]);
    await selectedEl.save();
  } catch (err) {
    await showWebflowError(err);
    return;
  }
}
