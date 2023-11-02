<script lang="ts">
  import { getNewEditorState } from './Editor.svelte';

  import { FILENAME } from '$lib/js/stores/filename';
  import { FILE_STATE } from '$lib/js/stores/fileState';
  import { LOADED_SASS_EL } from '$lib/js/stores/loadedSassEl';
  import { STORE_EDITOR_CONTENT } from '$lib/js/stores/editorContent';

  let isConfirmationStage = false;

  function editorResetInit(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    // MAYBE: warn for any unsaved style changes in this middle stage
    // can be probably done by equating the existing Sass text to current editor text

    document.body.addEventListener(
      'click',
      () => {
        isConfirmationStage = false;
      },
      { once: true }
    );

    isConfirmationStage = true;
  }

  function editorResetConfirm() {
    window.CODEMIRROR_INSTANCE.setState(getNewEditorState());
    STORE_EDITOR_CONTENT.set('');
    LOADED_SASS_EL.set(null);
    FILENAME.set('');
    FILE_STATE.set('new');
  }
</script>

{#if !isConfirmationStage}
  <button class="button-default" on:click|preventDefault={editorResetInit}>Start a new file</button>
{:else}
  <button
    class="button-danger"
    on:click|preventDefault={editorResetConfirm}
    on:blur={() => (isConfirmationStage = false)}>Sure?</button
  >
{/if}
