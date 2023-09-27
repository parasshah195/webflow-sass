<script context="module" lang="ts">
  import { compileStringAsync as sassAsyncCompile } from 'sass';

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
  export async function getCompiledCodeFromEditor(): Promise<
    ProcessedCode | false
  > {
    const sassCode = getContext<EditorView>({ CODEMIRROR_INSTANCE_CONTEXT_KEY })
      .state.doc.toString()
      .replace(/[\n\r]/g, '');

    if (!sassCode || '' === sassCode) {
      await showWebflowError("Can't save an empty document");
      return false;
    }

    let compiledCSS = '';

    // run sass lib on it, error check
    try {
      const sassCompiled = await sassAsyncCompile(sassCode, {
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
  import { getContext, onMount, setContext } from 'svelte';
  import { EditorView, basicSetup } from 'codemirror';
  import { EditorState } from '@codemirror/state';
  import { oneDark } from '@codemirror/theme-one-dark';
  import { sass as sassEditorLang } from '@codemirror/lang-sass';
  import {
    CODEMIRROR_INSTANCE_CONTEXT_KEY,
    SASS_EDITMODE_CONTEXT_KEY,
    type SassEditmodeContextValue,
  } from '../js/contexts';
  import { writable } from 'svelte/store';
  import { showWebflowError } from '../js/webflowNotify';

  let editorEl: HTMLDivElement;

  onMount(() => {
    const CODEMIRROR_INSTANCE = new EditorView({
      parent: editorEl,
      state: getNewEditorState(),
    });

    setContext({ CODEMIRROR_INSTANCE_CONTEXT_KEY }, CODEMIRROR_INSTANCE);
    setContext({ SASS_EDITMODE_CONTEXT_KEY }, {
      mode: writable('new'),
    } as SassEditmodeContextValue);
  });
</script>

<div bind:this={editorEl} />
