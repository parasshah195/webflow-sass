export async function showWebflowError(message: string) {
  await webflow.notify({
    type: 'Error',
    message: message,
  });
}
