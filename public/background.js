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

    chrome.contextMenus.create({
        id: "autoTranslateChat",
        title: "Auto Translate Chat",
        contexts: ["all"],
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "sendToChatBot") {
        console.log("Sending message to Brow");
        chrome.tabs.sendMessage(tab.id, { action: "enableHoverEffect" });
    }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "autoTranslateChat") {
        chrome.tabs.sendMessage(tab.id, { action: "autoTranslate" });
    }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'openSidePanel') {
    console.log("background open side panel");
    chrome.sidePanel.open({ windowId: tab.windowId });
  }
});


 chrome.runtime.onMessage.addListener(
     function(request, sender, sendResponse) {
         if (request.message === "getKey") {
             chrome.storage.sync.get("key", function (obj) {
                 if (!obj.hasOwnProperty("key")) {
                     chrome.tabs.query({active: true}, function(tabs) {
                         console.log("tabs:", tabs);
                         chrome.tabs.sendMessage(tabs[0].id, {action: "setApiKey"}, function(response) {
                             if (!chrome.runtime.lastError) {
                                 sendResponse({apiKey: response.key});
                             }
                         });
                     });
                 } else {
                     sendResponse({apiKey: obj.key});
                 }

             });
             return true;
         }
        if (request.message === "clearSelection") {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {action: "clearSelection"});
            });
        }
     }
 );
