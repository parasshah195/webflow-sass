import type { Writable } from 'svelte/store';

export interface SassEditmodeContextValue {
  mode: Writable<'new' | 'load'>;
}

export interface LoadedSassContextValue {
  el: Writable<DOMElement | null>;
}

export const CODEMIRROR_INSTANCE_CONTEXT_KEY = { name: 'CODEMIRROR_INSTANCE' };
export const SASS_EDITMODE_CONTEXT_KEY = { name: 'SASS_EDITMODE' };
/**
 * The webflow Sass element that's currently loaded into the editor
 */
export const SASS_LOADED_EL_CONTEXT_KEY = { name: 'SASS_LOADED_EL' };
