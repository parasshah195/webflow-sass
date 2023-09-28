interface FilenameObject {
  scss: string;
  css: string;
}

export function getFilenamesWithExtension(
  filenameInputValue: string
): FilenameObject {
  if (!filenameInputValue) {
    filenameInputValue = 'unnamed';
  }

  return {
    scss: filenameInputValue + '.scss',
    css: filenameInputValue + '.css',
  };
}

export function removeFilenameExtension(name: string) {
  return name.replace(/\.scss|\.css/, '');
}
