<script context="module" lang="ts">
  interface EditorSnapshot {
    EDITOR_CONTENT: string;
    EDITOR_FILE_STATE: EditorFileState;
    LOADED_SASS_EL: LoadedSassEl;
    CURRENT_FILENAME: string;
  }
</script>

<script lang="ts">
  import '$lib/css/style.scss';
  import type { Snapshot } from './$types';

  import { get } from 'svelte/store';

  import { FILENAME } from '$lib/js/stores/filename';
  import { FILE_STATE, type EditorFileState } from '$lib/js/stores/fileState';
  import { LOADED_SASS_EL, type LoadedSassEl } from '$lib/js/stores/loadedSassEl';

  import { getNewEditorState } from './Editor.svelte';

  import { onMount } from 'svelte';
  import EditorForm from './EditorForm.svelte';

  onMount(async () => {
    await webflow.setExtensionSize({ width: 500, height: 1080 });
  });

  //TODO: snapshots might not be required. see if svelte stores persists through page navigations, and if yes, just restore the store values on component initialization
  export const snapshot: Snapshot<string> = {
    capture: () => {
      const snapshotObj: EditorSnapshot = {
        EDITOR_CONTENT: window.CODEMIRROR_INSTANCE.state.doc.toString(),
        LOADED_SASS_EL: get(LOADED_SASS_EL),
        EDITOR_FILE_STATE: get(FILE_STATE),
        CURRENT_FILENAME: get(FILENAME)
      };
      return JSON.stringify(snapshotObj);
    },
    restore: (value) => {
      try {
        const snapshotObj: EditorSnapshot = JSON.parse(value);
        FILENAME.set(snapshotObj.CURRENT_FILENAME);
        FILE_STATE.set(snapshotObj.EDITOR_FILE_STATE);
        window.CODEMIRROR_INSTANCE.setState(getNewEditorState(snapshotObj.EDITOR_CONTENT));
      } catch (err) {
        console.error('Failed to restore snapshot', err);
        return;
      }
    }
  };
</script>

<main>
  <EditorForm />
</main>
