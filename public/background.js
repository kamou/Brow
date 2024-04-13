chrome.runtime.onInstalled.addListener(() => {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    chrome.contextMenus.create({
        id: "sendToChatBot",
        title: "Send to Brow",
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

