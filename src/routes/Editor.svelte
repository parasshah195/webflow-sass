<script context="module" lang="ts">
  import { compileString as sassCompile } from 'sass';
  import type { CompileResult as sassCompileResult, Exception as sassException } from 'sass';
  import { EditorView, basicSetup } from 'codemirror';
  import { keymap } from '@codemirror/view';
  import { EditorState } from '@codemirror/state';
  import { oneDark } from '@codemirror/theme-one-dark';
  import { indentWithTab } from '@codemirror/commands';
  import { sass as sassEditorLang } from '@codemirror/lang-sass';
  import { cleanupNonAsciiChars } from '$lib/js/cleanupNonAsciiChars';
  import { registerWebflowClassCompletions } from '$lib/js/editor/autocompleteClassnames';
  import { registerWebflowVarsCompletions } from '$lib/js/editor/autocompleteVariables';

  interface ProcessedCode {
    sass: string;
    css: string;
  }

  /**
   * Returns a new Sass editor state
   * @param initText the text that the new state shall initialize with. Default empty string
   */
  export function getNewEditorState(initText = '') {
    initText = cleanupNonAsciiChars(initText);

    return EditorState.create({
      doc: initText,
      extensions: [
        basicSetup,
        sassEditorLang(),
        registerWebflowClassCompletions(),
        registerWebflowVarsCompletions(),
        oneDark,
        keymap.of([indentWithTab])
      ]
    });
  }

  /**
   * Get Sass from editor and compile it to CSS
   * This function is responsible for showing webflow error notifications
   * @returns Compiled code or `false` if any error
   */
  export async function getCompiledCodeFromEditor(): Promise<ProcessedCode | false> {
    const editorSassCode = window.CODEMIRROR_INSTANCE.state.doc.toString();
    const sassCode = cleanupNonAsciiChars(editorSassCode);

    if (!sassCode || '' === sassCode) {
      await showWebflowError(ERROR_TEXTS.emptyFile);
      return false;
    }

    let sassCompiled: sassCompileResult;

    try {
      sassCompiled = sassCompile(sassCode, {
        style: 'compressed',
        quietDeps: true
      });
    } catch (err) {
      const error = err as sassException;

      const friendlyLog = `Code error: \n${error.sassMessage} @ line ${
        error.span.start.line + 1
      }:col ${error.span.start.column}`;
      await showWebflowError(friendlyLog);

      console.error(error.message);
      return false;
    }

    return {
      sass: sassCode,
      css: sassCompiled.css
    };
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte';

  import { ERROR_TEXTS, showWebflowError } from '$lib/js/webflowNotify';
  import { STORE_EDITOR_CONTENT } from '$lib/js/stores/editorContent';
  import { get } from 'svelte/store';
  import { beforeNavigate } from '$app/navigation';

  let editorWrapperEl: HTMLDivElement;
  let editorEl: HTMLElement;

  onMount(() => {
    window.CODEMIRROR_INSTANCE = new EditorView({
      parent: editorWrapperEl,
      state: getNewEditorState(get(STORE_EDITOR_CONTENT))
    });

    editorEl = editorWrapperEl.children[0] as HTMLElement;

    updateEditorHeight();
  });

  beforeNavigate(() => {
    STORE_EDITOR_CONTENT.set(window.CODEMIRROR_INSTANCE.state.doc.toString());
  });

  // TODO: update programmatically by calculating and subtracting other items heights
  // There shall be no vertical scrollbar
  function updateEditorHeight() {
    const documentHeight = document.documentElement.clientHeight;

    if (editorEl) {
      editorEl.style.height = `${documentHeight - 145}px`;
    }
  }
</script>

<svelte:window on:resize={updateEditorHeight} />

<div class="code-editor" bind:this={editorWrapperEl} />
