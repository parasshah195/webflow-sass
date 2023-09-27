<script context="module" lang="ts">
  import * as sass from 'sass';

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
   * Shows Weblow errors when required
   */
  export async function getCompiledCodeFromEditor(
    CODEMIRROR_INSTANCE: EditorView
  ): Promise<ProcessedCode | false> {
    const sassCode = CODEMIRROR_INSTANCE.state.doc
      .toString()
      .replace(/[\n\r]/g, '');

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
  import { EditorView, basicSetup } from 'codemirror';
  import { EditorState } from '@codemirror/state';
  import { oneDark } from '@codemirror/theme-one-dark';
  import { sass as sassEditorLang } from '@codemirror/lang-sass';
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
