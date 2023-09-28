<script lang="ts">
  import { Router } from '@roxi/routify';
  import { routes } from '../.routify/routes';

  import { onMount } from 'svelte';

  onMount(async () => {
    await webflow.setExtensionSize({ width: 500, height: 1080 });
  });
</script>

<Router {routes} />
