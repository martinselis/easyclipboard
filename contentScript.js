var events = 0;
var inputs;
var result;

// Listen for messages from other parts of app/extension
function listenToMessages() {
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.greeting) {
        var passedBlurb = request.greeting.split(":");
        callBlurb(passedBlurb);
      }
    }
  )
}

// Update input field with blurb
function callBlurb(passedBlurb) {
  var output;
  chrome.storage.sync.get(['blurbs'], function(result) {
    for (let i = 0; i < result["blurbs"].length; i++) {
      if (result["blurbs"][i]["category"] == passedBlurb[0] && result["blurbs"][i]["title"] == passedBlurb[1]) {
        var myInput = document.activeElement
        if (document.activeElement) {
            myInput.value += result["blurbs"][i]["blurb"];
            console.log(myInput)
            break
        }
      }
    }
  })
}

listenToMessages()
