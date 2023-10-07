<script lang="ts">
  import { base } from '$app/paths';
  import ChevronLeft from '$lib/components/ChevronLeft.svelte';
</script>

<main>
  <div class="page-wrapper">
    <a class="has-arrow" href="{base}/">
      <ChevronLeft />
      Back to the app
    </a>
    <slot>
      <!-- Page content will be rendered here -->
    </slot>
  </div>
</main>

<style>
  a {
    position: relative;
    z-index: 1;
  }
</style>
