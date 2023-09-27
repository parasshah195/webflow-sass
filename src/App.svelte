<script lang="ts">
  import { onMount } from 'svelte';
  import EditorForm from './components/EditorForm.svelte';

  onMount(async () => {
    await webflow.setExtensionSize({ width: 500, height: 1080 });
  });
</script>

<main>
  <EditorForm />
</main>
