chrome.storage.sync.get(['key'], function(result) {
  console.log('Value in Sidebar is ' + result.key);
});

// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     if (request.action == "updatePanel") {
//       // Logic to handle the update
//       console.log("Received data for the side panel:", request.data);
//       // Update the side panel's content based on received data
//       sendResponse({ result: "Updated successfully!" });
//     }
//   }
// );
