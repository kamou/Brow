console.log('contentScript.js loaded');
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('contentScript.js received message:', request);
  if (request.cmd === 'replaceText') {
    console.log('Replacing text');
    let bodyText = document.body.innerHTML;
    bodyText = bodyText.replace(/pain au chocolat/gi, 'chocolatine');
    document.body.innerHTML = bodyText;
  }
});

