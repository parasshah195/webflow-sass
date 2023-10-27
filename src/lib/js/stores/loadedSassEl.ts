export type LoadedSassEl = DOMElement | null;

import { writable, type Writable } from 'svelte/store';

/**
 * Sets a loaded Sass El from the Webflow DOM is one exists
 * @default null
 */
export const LOADED_SASS_EL: Writable<LoadedSassEl> = writable(null);
