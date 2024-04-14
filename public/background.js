chrome.runtime.onInstalled.addListener(() => {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    chrome.contextMenus.create({
        id: "sendToChatBot",
        title: "Send to Brow",
        contexts: ["all"],
    });

    chrome.contextMenus.create({
        id: "openSidePanel",
        title: "Open Brow",
        contexts: ["all"],
    });
});

console.log("register context onclicked listener");
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "sendToChatBot") {
        console.log("Sending message to Brow");
        chrome.tabs.sendMessage(tab.id, { action: "enableHoverEffect" });
    }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'openSidePanel') {
    // This will open the panel in all the pages on the current window.
    console.log("background open side panel");
    chrome.tabs.sendMessage(tab.id, { action: "setApiKey" });
    chrome.sidePanel.open({ windowId: tab.windowId });
  }
});


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.message === "getKey") {
            console.log("getKey called on background.js side");
            chrome.storage.sync.get("key", function (obj) {
                console.log("sending", obj.key);
                sendResponse({apiKey: obj.key});
            });
        }
        return true;  // Will respond asynchronously.
    });
