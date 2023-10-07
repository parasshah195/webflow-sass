<script lang="ts">
  import { onMount } from 'svelte';

  import { ERROR_TEXTS, showWebflowError } from '$lib/js/webflowNotify';
  import { removeFilenameExtension } from '$lib/js/filename';
  import { getNewEditorState } from './Editor.svelte';
  import type { EditorView } from 'codemirror';
  import type { EditorFileTypes, LoadedSassEl } from './EditorForm.svelte';

  let clickable = false;
  export let filename: string;
  export let CODEMIRROR_INSTANCE: EditorView;
  export let EDITOR_FILE_TYPE: EditorFileTypes;
  export let LOADED_SASS_EL: LoadedSassEl;

  let webflowSelectedElUnsub: () => undefined;

  onMount(() => {
    webflowSelectedElUnsub = webflow.subscribe('selectedelement', (selectedEl) => {
      if (!selectedEl || 'DOM' !== selectedEl.type || 'template' !== selectedEl.getTag()) {
        clickable = false;
        return;
      }

      clickable = true;

      // on unmount
      return () => webflowSelectedElUnsub();
    });
  });

  async function loadSass() {
    EDITOR_FILE_TYPE = 'load';

    const sassEl = (await webflow.getSelectedElement()) as DOMElement;
    if (!sassEl || !sassEl.children) {
      await showWebflowError(ERROR_TEXTS.invalidSassElLoad);
      return;
    }

    LOADED_SASS_EL = sassEl;

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
    CODEMIRROR_INSTANCE.setState(getNewEditorState(currentSassContent));
  }
</script>

<button class="button-default" disabled={!clickable} on:click|preventDefault={loadSass}
  >Edit selected Sass element code</button
>
