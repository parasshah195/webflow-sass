<script lang="ts">
  import { getContext } from 'svelte';
  import { getNewEditorState } from './Editor.svelte';
  import {
    CODEMIRROR_INSTANCE_CONTEXT_KEY,
    SASS_LOADED_EL_CONTEXT_KEY,
    type LoadedSassContextValue,
  } from '../js/contexts';
  import type { EditorView } from 'codemirror';

  let isConfirmationStage = false;

  function editorResetInit(event: Event) {
    event.preventDefault();
    event.stopPropagation();

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
    getContext<EditorView>({
      CODEMIRROR_INSTANCE_CONTEXT_KEY,
    }).setState(getNewEditorState());

    getContext<LoadedSassContextValue>({ SASS_LOADED_EL_CONTEXT_KEY }).el.set(
      null
    );

    // window.CODEMIRROR_INSTANCE.setState(getNewEditorState());
  }
</script>

{#if isConfirmationStage}
  <button class="button-link" on:click={editorResetInit}
    >Start a new file</button
  >
{:else}
  <button class="button-link" on:click={editorResetConfirm}>Sure?</button>
{/if}
