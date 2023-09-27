<script lang="ts">
  import { getNewEditorState } from './Editor.svelte';
  import type { EditorView } from 'codemirror';
  import type { EditorFileTypes, LoadedSassEl } from './EditorForm.svelte';

  export let filename: string;
  export let CODEMIRROR_INSTANCE: EditorView;
  export let LOADED_SASS_EL: LoadedSassEl;
  export let EDITOR_FILE_TYPE: EditorFileTypes;

  let isConfirmationStage = false;

  function editorResetInit(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    // TODO: warn for any unsaved style changes in this middle stage
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

  function editorResetConfirm(event: Event) {
    CODEMIRROR_INSTANCE.setState(getNewEditorState());
    LOADED_SASS_EL = null;
    filename = '';
    EDITOR_FILE_TYPE = 'new';
  }
</script>

{#if !isConfirmationStage}
  <button class="button-link" on:click={editorResetInit}
    >Start a new file</button
  >
{:else}
  <button class="button-link" on:click={editorResetConfirm}>Sure?</button>
{/if}
