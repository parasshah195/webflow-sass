<script lang="ts">
  import ChevronLeft from '$lib/components/ChevronLeft.svelte';
</script>

<main>
  <div class="page-wrapper">
    <button class="has-arrow" on:click={() => history.back()}>
      <ChevronLeft />
      Go back
    </button>

    <slot>
      <!-- Page content will be rendered here -->
    </slot>
  </div>
</main>

<style>
  button {
    position: relative;
    z-index: 1;
  }
</style>
