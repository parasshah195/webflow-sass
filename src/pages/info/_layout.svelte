<script lang="ts">
  import ChevronLeft from '../components/ChevronLeft.svelte';
  import { url } from '@roxi/routify';
</script>

<main>
  <a class="has-arrow" href={$url('/')}>
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
