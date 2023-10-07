<script lang="ts">
  import ChevronLeft from '$lib/components/ChevronLeft.svelte';
</script>

<main>
  <a class="has-arrow" href="/">
    <ChevronLeft />
    Back to the app
  </a>

  <slot>
    <!-- Page content will be rendered here -->
  </slot>
</main>

<style>
  a {
    position: relative;
    z-index: 1;
  }
</style>
