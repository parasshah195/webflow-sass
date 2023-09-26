interface FilenameObject {
  scss: string;
  css: string;
}

export function getFilenameInputEl() {
  return document.getElementsByName('filename')[0] as HTMLInputElement;
}

export function getFilenamesWithExtension(
  filenameInputEl: HTMLInputElement
): FilenameObject {
  return {
    scss: filenameInputEl.value + '.scss',
    css: filenameInputEl.value + '.css',
  };
}

export function removeFilenameExtension(name: string) {
  return name.replace(/\.scss|\.css/, '');
}
