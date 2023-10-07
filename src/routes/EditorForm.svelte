<script context="module" lang="ts">
  export type EditorFileTypes = 'new' | 'load';
  export type LoadedSassEl = DOMElement | null;
</script>

<script lang="ts">
  import { base } from '$app/paths';
  import Editor, { getCompiledCodeFromEditor } from './Editor.svelte';
  import NewEditorFileLink from './NewFileLink.svelte';
  import SassLoadButton from './LoadSassButton.svelte';

  import {
    ERROR_TEXTS,
    INFO_TEXTS,
    showCssElNotFoundErrors,
    showWebflowError,
    showWebflowInfoMessage,
    showWebflowSuccessfulSave
  } from '$lib/js/webflowNotify.js';
  import { getFilenamesWithExtension } from '$lib/js/filename.js';
  import { getCssDomId, CSS_DOM_ID_ATTRIBUTE } from '$lib/js/getCssDomId.js';
  import type { EditorView } from 'codemirror';
  import { getWebflowElByID } from '$lib/js/getWebflowElByID';

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
    if (!LOADED_SASS_EL || !(await getWebflowElByID(LOADED_SASS_EL.id))) {
      LOADED_SASS_EL = null;
      await showWebflowError(INFO_TEXTS.sassDomNotFound);
      await createNewSassDOM();
      return;
    }

    if (!LOADED_SASS_EL.textContent) {
      await showWebflowError(ERROR_TEXTS.sassDomCantUpdate);
      return;
    }

    const filenames = getFilenamesWithExtension(filenameInputVal);

    const compiledCode = await getCompiledCodeFromEditor(CODEMIRROR_INSTANCE);
    if (!compiledCode) {
      return;
    }

    // set scss
    try {
      LOADED_SASS_EL.setTextContent(compiledCode.sass);
      await addStyle(filenames.scss, LOADED_SASS_EL);
      await LOADED_SASS_EL.save();
    } catch (err) {
      console.error(err);
    }

    // set css
    const cssDomId = getCssDomId(LOADED_SASS_EL);
    const currentSelectedEl = await webflow.getSelectedElement();

    if (!currentSelectedEl) {
      await showCssElNotFoundErrors();
      return;
    }

    if (cssDomId) {
      // find the CSS element and update
      const currentCssEl = await getWebflowElByID(cssDomId);

      if (!currentCssEl) {
        await createNewCSSElForSass(currentSelectedEl, LOADED_SASS_EL, compiledCode.css);
        return;
      }

      if (!currentCssEl.children || !currentCssEl.textContent) {
        showWebflowInfoMessage(INFO_TEXTS.cssUpdateError);
        await createNewCSSElForSass(currentSelectedEl, LOADED_SASS_EL, compiledCode.css);
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
      if ('DOM' === currentSelectedEl.type && 'template' === currentSelectedEl.getTag()) {
        await showCssElNotFoundErrors();
        return;
      }

      createNewCSSElForSass(currentSelectedEl, LOADED_SASS_EL, compiledCode.css);
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
      const newSassEl = await createNewSassEl(compiledCode.sass, filenames.scss);
      const newCSSEl = await createNewCSSEl(compiledCode.css, filenames.css);

      newSassEl.setAttribute(CSS_DOM_ID_ATTRIBUTE, newCSSEl.id);

      const currentSelectedElChildren = selectedEl.getChildren();
      selectedEl.setChildren([...currentSelectedElChildren, newSassEl, newCSSEl]);
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

  async function createNewSassEl(compiledSass: string, sassFilename: string): Promise<DOMElement> {
    const newSassEl = webflow.createDOM('template');
    newSassEl.setTextContent(compiledSass);
    // const newSassStringEl = webflow.createString(compiledSass);
    // newSassEl.setChildren([newSassStringEl]);
    await addStyle(sassFilename, newSassEl);

    return newSassEl;
  }

  async function createNewCSSEl(compiledCSS: string, cssFilename: string): Promise<DOMElement> {
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
    if (!currentEl.children || ('DOM' === currentEl.type && 'template' === currentEl.getTag())) {
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
  <div class="form_top-area">
    <SassLoadButton
      bind:filename={filenameInputVal}
      bind:EDITOR_FILE_TYPE
      bind:LOADED_SASS_EL
      {CODEMIRROR_INSTANCE}
    />

    <input
      type="text"
      name="filename"
      placeholder="Enter filename (E.g: 'Global Styles')"
      title="Allowed characters - Letters, Numbers, Space, Hyphen, and Underscores"
      required
      pattern="^[\w\s\-_]*$"
      size="35"
      bind:value={filenameInputVal}
    />
  </div>

  <Editor bind:CODEMIRROR_INSTANCE />

  <button type="submit" class="button-primary">Compile & Save Code</button>

  <hr />

  <div class="form_bottom-area">
    <div class="form_bottom-column is-action-button">
      <NewEditorFileLink
        bind:filename={filenameInputVal}
        bind:EDITOR_FILE_TYPE
        bind:LOADED_SASS_EL
        {CODEMIRROR_INSTANCE}
      />
    </div>

    <div class="form_bottom-column is-links">
      <a href="{base}/notes">App Notes</a>
      <a href="{base}/credits">Credits & License</a>
    </div>
  </div>
</form>
