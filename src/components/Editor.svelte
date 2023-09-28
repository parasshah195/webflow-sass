<script context="module" lang="ts">
  import * as sass from 'sass';
  import { EditorView, basicSetup } from 'codemirror';
  import { EditorState } from '@codemirror/state';
  import { oneDark } from '@codemirror/theme-one-dark';
  import { sass as sassEditorLang } from '../js/codemirrorSass';

  interface ProcessedCode {
    sass: string;
    css: string;
  }

  /**
   * Returns a new Sass editor state
   * @param initText the text that the new state shall initialize with. Default empty string
   */
  export function getNewEditorState(initText = '') {
    return EditorState.create({
      doc: initText,
      extensions: [basicSetup, sassEditorLang(), oneDark],
    });
  }

  /**
   * Get Sass from editor and compile it to CSS
   * This function is responsible for showing webflow error notifications
   * @returns Compiled code or `false` if any error
   */
  export async function getCompiledCodeFromEditor(
    CODEMIRROR_INSTANCE: EditorView
  ): Promise<ProcessedCode | false> {
    const sassCode = CODEMIRROR_INSTANCE.state.doc.toString();
    // .replace(/[\n\r]/g, '');

    if (!sassCode || '' === sassCode) {
      await showWebflowError(ERROR_TEXTS.emptyFile);
      return false;
    }

    let compiledCSS = '';

    try {
      const sassCompiled = sass.compileString(sassCode, {
        style: 'compressed',
        quietDeps: true,
      });

      compiledCSS = sassCompiled.css;
    } catch (err) {
      await showWebflowError((err as Error).message);
      console.error(err);
      return false;
    }

    return {
      sass: sassCode,
      css: compiledCSS,
    };
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { ERROR_TEXTS, showWebflowError } from '../js/webflowNotify';

  export let CODEMIRROR_INSTANCE: EditorView;

  let editorEl: HTMLDivElement;

  onMount(() => {
    CODEMIRROR_INSTANCE = new EditorView({
      parent: editorEl,
      state: getNewEditorState(),
    });
  });
</script>

<div bind:this={editorEl} />
