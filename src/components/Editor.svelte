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

    // try {
    let sassCompileErrorLog = '';
    console.log('compile string');
    const sassCompiled = sass.compileString(sassCode, {
      style: 'compressed',
      quietDeps: true,
      logger: {
        // BUGFIX: Logger doesn't seem to be working. Sass error triggers before that
        warn(message, options) {
          console.log('sass logger!');
          if (options.span) {
            sassCompileErrorLog +=
              `@Line ${options.span.start.line}, Column ${options.span.start.column}. ` +
              `${message}\n`;
          } else {
            sassCompileErrorLog += `::: ${message}\n`;
          }
        },
      },
    });

    if ('' !== sassCompileErrorLog) {
      console.log('found error');
      await showWebflowError(sassCompileErrorLog);
      console.error(sassCompileErrorLog);
      return false;
    }

    // } catch (err) {
    //   await showWebflowError((err as Error).message);
    //   console.error(err);
    //   return false;
    // }

    return {
      sass: sassCode,
      css: sassCompiled.css,
    };
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { ERROR_TEXTS, showWebflowError } from '../js/webflowNotify';

  export let CODEMIRROR_INSTANCE: EditorView;

  let editorWrapperEl: HTMLDivElement;

  onMount(() => {
    CODEMIRROR_INSTANCE = new EditorView({
      parent: editorWrapperEl,
      state: getNewEditorState(),
    });

    updateEditorHeight();
  });

  function updateEditorHeight() {
    const editorEl = editorWrapperEl.children[0] as HTMLElement;
    const documentHeight = document.documentElement.clientHeight;

    editorEl.style.height = `${documentHeight - 100}px`;
  }
</script>

<div
  class="code-editor"
  bind:this={editorWrapperEl}
  on:resize={updateEditorHeight}
/>
