export async function setExtensionSize() {
  // Set a vertically oriented window height, since it's a code editor app.
  await webflow.setExtensionSize({ width: 500, height: 1080 });
}
