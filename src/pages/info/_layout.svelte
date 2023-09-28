<script lang="ts">
  import ChevronLeft from '../components/ChevronLeft.svelte';
  import { url } from '@roxi/routify';
</script>

<main>
  <a href={$url('/')}>
    <ChevronLeft />
    Back to the app
  </a>

  <slot>
    <!-- Page content will be rendered here -->
  </slot>
</main>
