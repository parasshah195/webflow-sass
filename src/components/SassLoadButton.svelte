<button class="button-default" id="editor-load-sass" disabled={!clickable}>Load selected element Sass</button>

<script lang="ts">
  let clickable = false;

  webflow.subscribe('selectedelement', (selectedEl) => {
    if (!selectedEl || 'DOM' !== selectedEl.type || 'template' !== selectedEl.getTag()) {
      clickable = false;
      return;
    }

    clickable = true;
  });
</script>