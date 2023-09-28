<script context="module" lang="ts">
  export type EditorFileTypes = 'new' | 'load';
  export type LoadedSassEl = DOMElement | null;
</script>

<script lang="ts">
  import Editor, { getCompiledCodeFromEditor } from './Editor.svelte';
  import NewEditorFileLink from './NewFileLink.svelte';
  import SassLoadButton from './LoadSassButton.svelte';

  import {
    ERROR_TEXTS,
    INFO_TEXTS,
    showCssElNotFoundErrors,
    showWebflowError,
    showWebflowInfoMessage,
    showWebflowSuccessfulSave,
  } from '../js/webflowNotify.js';
  import { getFilenamesWithExtension } from '../js/filename.js';
  import { getCssDomId, CSS_DOM_ID_ATTRIBUTE } from '../js/getCssDomId.js';
  import type { EditorView } from 'codemirror';

  let filenameInputVal: string;

  let CODEMIRROR_INSTANCE: EditorView;
  /**
   * Defines whether the code file is new or existing
   */
  let EDITOR_FILE_TYPE: EditorFileTypes = 'new';

  let LOADED_SASS_EL: LoadedSassEl = null;

  /**
   * Note: `setTextContent` method is used to set the content, and el.getChildren()[0].getText() is used to fetch content. Seems to be the same thing
   */

  export async function processSass() {
    if ('' === filenameInputVal) {
      await showWebflowError(ERROR_TEXTS.missingFilename);
      return;
    }

    if ('new' === EDITOR_FILE_TYPE) {
      createNewSassDOM();
    } else {
      updateSass();
    }
  }

  export async function updateSass() {
    if (!LOADED_SASS_EL) {
      await showWebflowError(ERROR_TEXTS.sassDomNotFound);
      await createNewSassDOM();
      return;
    }

    const sassEl = LOADED_SASS_EL;

    if (!sassEl.textContent) {
      await showWebflowError(ERROR_TEXTS.sassDomCantUpdate);
      return;
    }

    const filenames = getFilenamesWithExtension(filenameInputVal);

    const compiledCode = await getCompiledCodeFromEditor(CODEMIRROR_INSTANCE);
    if (!compiledCode) {
      return;
    }

    // set scss
    sassEl.setTextContent(compiledCode.sass);
    await addStyle(filenames.scss, sassEl);
    await sassEl.save();

    // set css
    const cssDomId = getCssDomId(sassEl);
    const currentSelectedEl = await webflow.getSelectedElement();

    if (!currentSelectedEl) {
      await showCssElNotFoundErrors();
      return;
    }

    if (cssDomId) {
      // find the CSS element and update
      const allElements = await webflow.getAllElements();
      const currentCssEl = allElements.find(
        (el) => el.id === cssDomId.domID
      ) as DOMElement;

      if (!currentCssEl) {
        await createNewCSSElForSass(
          currentSelectedEl,
          sassEl,
          compiledCode.css
        );
        return;
      }

      if (!currentCssEl.children || !currentCssEl.textContent) {
        showWebflowInfoMessage(INFO_TEXTS.cssUpdateError);
        await createNewCSSElForSass(
          currentSelectedEl,
          sassEl,
          compiledCode.css
        );
        return;
      }

      try {
        currentCssEl.setTextContent(compiledCode.css);
        await addStyle(filenames.css, currentCssEl);
        await currentCssEl.save();
        await showWebflowSuccessfulSave();
      } catch (err) {
        showWebflowError((err as Error).message);
        return;
      }
    } else {
      if (
        'DOM' === currentSelectedEl.type &&
        'template' === currentSelectedEl.getTag()
      ) {
        await showCssElNotFoundErrors();
        return;
      }

      createNewCSSElForSass(currentSelectedEl, sassEl, compiledCode.css);
      await showWebflowSuccessfulSave();
      return;
    }
  }

  export async function createNewSassDOM() {
    const compiledCode = await getCompiledCodeFromEditor(CODEMIRROR_INSTANCE);
    if (!compiledCode) {
      return;
    }

    const selectedEl = await webflow.getSelectedElement();
    if (
      !selectedEl ||
      !selectedEl.children ||
      ('DOM' === selectedEl.type &&
        ('template' === selectedEl.getTag() || 'style' === selectedEl.getTag()))
    ) {
      await showWebflowError(ERROR_TEXTS.invalidCodeElParent);
      return;
    }

    // add it as a new element
    const filenames = getFilenamesWithExtension(filenameInputVal);

    try {
      const newSassEl = await createNewSassEl(
        compiledCode.sass,
        filenames.scss
      );
      const newCSSEl = await createNewCSSEl(compiledCode.css, filenames.css);

      newSassEl.setAttribute(CSS_DOM_ID_ATTRIBUTE, newCSSEl.id);

      const currentSelectedElChildren = selectedEl.getChildren();
      selectedEl.setChildren([
        ...currentSelectedElChildren,
        newSassEl,
        newCSSEl,
      ]);
      await selectedEl.save();

      // change mode to continue updating the same Sass and CSS files.
      EDITOR_FILE_TYPE = 'load';
      LOADED_SASS_EL = newSassEl;

      await showWebflowSuccessfulSave();
    } catch (err) {
      console.error(err);
      await showWebflowError((err as Error).message);
      return;
    }
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
  async function addStyle(className: string, webflowEl: DOMElement) {
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
   * Generates a new CSS element for an existing Sass. Updates the Sass' CSS DOM ID attribute
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
      await showWebflowError(ERROR_TEXTS.invalidCssParent);
      return;
    }

    const filenames = getFilenamesWithExtension(filenameInputVal);
    const newCSSEl = await createNewCSSEl(compiledCSS, filenames.css);

    try {
      sassEl.setAttribute(CSS_DOM_ID_ATTRIBUTE, newCSSEl.id);
      await sassEl.save();

      const currentSelectedElChildren = currentEl.getChildren();
      currentEl.setChildren([...currentSelectedElChildren, newCSSEl]);

      await currentEl.save();
    } catch (err) {
      showWebflowError((err as Error).message);
      return;
    }
  }
</script>

<form class="form_component" on:submit|preventDefault={processSass}>
  <div class="form_top-actions">
    <input
      type="text"
      name="filename"
      placeholder="Enter filename (E.g: 'Global Styles')"
      bind:value={filenameInputVal}
    />

    <button type="submit" class="button">Save</button>
  </div>

  <Editor bind:CODEMIRROR_INSTANCE />

  <div class="form_bottom-actions">
    <div class="form_bottom-newfile-wrapper">
      <SassLoadButton
        bind:filename={filenameInputVal}
        bind:EDITOR_FILE_TYPE
        bind:LOADED_SASS_EL
        {CODEMIRROR_INSTANCE}
      />
      <NewEditorFileLink
        bind:filename={filenameInputVal}
        bind:EDITOR_FILE_TYPE
        bind:LOADED_SASS_EL
        {CODEMIRROR_INSTANCE}
      />
    </div>
  </div>
</form>
