<script lang="ts">
  import { onMount } from 'svelte';

  import { ERROR_TEXTS, showWebflowError } from '$lib/js/webflowNotify';
  import { removeFilenameExtension } from '$lib/js/filenameExt';
  import { getNewEditorState } from './Editor.svelte';

  import { FILENAME } from '$lib/js/stores/filename';
  import { FILE_STATE } from '$lib/js/stores/fileState';
  import { LOADED_SASS_EL } from '$lib/js/stores/loadedSassEl';
  import { STORE_EDITOR_CONTENT } from '$lib/js/stores/editorContent';

  let clickable = false;

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
    const sassEl = (await webflow.getSelectedElement()) as DOMElement;
    const currentSassStringEl = sassEl.getChildren()[0];

    if (!sassEl || !sassEl.children) {
      await showWebflowError(ERROR_TEXTS.invalidSassElLoad);
      return;
    }

    if ('String' !== currentSassStringEl.type) {
      await showWebflowError(ERROR_TEXTS.sassLoadNoCode);
      return;
    }

    FILE_STATE.set('load');
    LOADED_SASS_EL.set(sassEl);

    let currentFileName = '';

    if (sassEl.styles) {
      const currentElStyles = await sassEl.getStyles();
      const currentFileNameWithExtn = currentElStyles[0].getName();
      currentFileName = removeFilenameExtension(currentFileNameWithExtn);

      FILENAME.set(currentFileName);
    }

    const currentSassContent = currentSassStringEl.getText();
    window.CODEMIRROR_INSTANCE.setState(getNewEditorState(currentSassContent));
    STORE_EDITOR_CONTENT.set(currentSassContent);
  }
</script>

<button
  class="button-default"
  disabled={!clickable}
  title={!clickable ? 'Select an .scss file in navigator to edit' : null}
  on:click|preventDefault={loadSass}>Edit .scss file</button
>
