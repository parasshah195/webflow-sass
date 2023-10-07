// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface ProcessedCode {
			sass: string;
			css: string;
		}

		interface FilenameObject {
			scss: string;
			css: string;
		}
	}
}

export {};
