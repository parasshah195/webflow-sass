<script lang="ts">
  import Editor from "./components/Editor.svelte";
  import NewEditorFileLink from "./components/NewEditorFileLink.svelte";
  import SassLoadButton from "./components/SassLoadButton.svelte";
</script>

<main>

  <form class="form_component" id="form-sass-editor">

    <div class="form_top-actions">
      <input type="text" name="filename" placeholder="Enter filename (E.g: 'Global Styles')" value="test">
      <button type="submit" class="button" id="editor-save-sass">Save</button>
    </div>
  
    <Editor />
  
    <div class="form_bottom-actions">
      
      <div class="form_bottom-newfile-wrapper">
        <SassLoadButton />
        <NewEditorFileLink />
      </div>
    </div>
  </form>

</main>