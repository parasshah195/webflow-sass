<script lang="ts">
  import { getContext, onMount, setContext } from 'svelte';
  import {
    SASS_LOADED_EL_CONTEXT_KEY,
    type LoadedSassContextValue,
    type SassEditmodeContextValue,
    SASS_EDITMODE_CONTEXT_KEY,
    CODEMIRROR_INSTANCE_CONTEXT_KEY,
  } from '../js/contexts';
  import { ERROR_TEXTS, showWebflowError } from '../js/webflowNotify';
  import { writable } from 'svelte/store';
  import { removeFilenameExtension } from '../js/filename';
  import { format } from 'prettier/standalone.js';
  import parserPostcss from 'prettier/parser-postcss';
  import { getNewEditorState } from './Editor.svelte';
  import type { EditorView } from 'codemirror';

  let clickable = false;
  export let filename: string;

  setContext({ SASS_LOADED_EL_CONTEXT_KEY }, {
    el: writable(null),
  } as LoadedSassContextValue);

  const editMode = getContext<SassEditmodeContextValue>({
    SASS_EDITMODE_CONTEXT_KEY,
  }).mode;

  const loadedEl = getContext<LoadedSassContextValue>({
    SASS_LOADED_EL_CONTEXT_KEY,
  }).el;

  onMount(() => {
    webflow.subscribe('selectedelement', (selectedEl) => {
      if (
        !selectedEl ||
        'DOM' !== selectedEl.type ||
        'template' !== selectedEl.getTag()
      ) {
        clickable = false;
        return;
      }

      clickable = true;
    });
  });

  async function loadSass() {
    editMode.set('load');

    const sassEl = (await webflow.getSelectedElement()) as DOMElement;
    if (!sassEl || !sassEl.children) {
      await showWebflowError(ERROR_TEXTS.invalidSassElLoad);
      return;
    }

    loadedEl.set(sassEl);

    let currentFileName = '';

    if (sassEl.styles) {
      const currentElStyles = await sassEl.getStyles();
      const currentFileNameWithExtn = currentElStyles[0].getName();
      currentFileName = removeFilenameExtension(currentFileNameWithExtn);

      filename = currentFileName;
    }

    const currentSassStringEl = sassEl.getChildren()[0];

    if ('String' !== currentSassStringEl.type) {
      await showWebflowError(ERROR_TEXTS.sassLoadNoCode);
      return;
    }

    const currentSassContent = currentSassStringEl.getText();
    const formattedSass = await format(currentSassContent, {
      parser: 'scss',
      plugins: [parserPostcss],
    });

    getContext<EditorView>({ CODEMIRROR_INSTANCE_CONTEXT_KEY }).setState(
      getNewEditorState(formattedSass)
    );
  }
</script>

<button
  class="button-default"
  disabled={!clickable}
  on:click|preventDefault={loadSass}>Load selected element Sass</button
>
