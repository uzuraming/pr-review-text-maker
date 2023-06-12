chrome.runtime.onMessage.addListener(function (request, _, __) {
  if (request.message === "copyText") copyToTheClipboard(request.textToCopy);
  return true;
});
async function copyToTheClipboard(textToCopy) {
  navigator.clipboard.writeText(textToCopy);
}
