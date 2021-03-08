// Listen for messages from other parts of app/extension
function listenToMessages() {
  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (request?.blurb) {
      updateInputField(request.blurb);
    }
    sendResponse();
    return true;
  });
}

// Update input field with blurb by retrieving from db and updating, when the exact menu clicked
function updateInputField(passedBlurb) {
  const myInput = document.activeElement;
  if (document.activeElement) {
    myInput.value += passedBlurb;
  }
}

listenToMessages();
