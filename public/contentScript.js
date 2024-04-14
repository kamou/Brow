console.log('contentScript.js loaded');


let hoverEffectEnabled = false;
let hoveredElement = null;

function handleMouseOver(event) {
    if (hoverEffectEnabled) {
        hoveredElement = event.target;
        hoveredElement.style.backgroundColor = 'rgba(0, 120, 255, 0.2)';
    }
}

function handleMouseOut(event) {
    if (hoverEffectEnabled && hoveredElement) {
        hoveredElement.style.backgroundColor = '';
        hoveredElement = null;
    }
}

document.addEventListener('mouseover', handleMouseOver, false);
document.addEventListener('mouseout', handleMouseOut, false);

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action === "setApiKey") {
            chrome.storage.sync.get(['key'], function(result) {
                if (!result.key || result.key === null) {
                    let apiKey = prompt("Please enter your OpenAI API key:", "");
                    chrome.storage.sync.set({'key': apiKey}, function() {
                        console.log('Key is set to ' + apiKey);
                        sendResponse({key: apiKey});
                    });
                } else {
                    console.log('Value currently is ' + result.key);
                    sendResponse({key: result.key});
                }
            });
            return true;
        }
    });
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log('contentScript.js received message:', request);
        if (request.action === "enableHoverEffect") {
            console.log('contentScript.js enable hover effect:', request);
            hoverEffectEnabled = true;
        } else if (request.action === "getClickedElement" && hoveredElement) {
            const elementInfo = {
                tagName: hoveredElement.tagName,
                outerHTML: hoveredElement.outerHTML,
            };
            sendResponse(elementInfo);
            hoveredElement.style.backgroundColor = '';
            hoverEffectEnabled = false;
        }
    }
);


document.addEventListener('click', handleClick, false);

function handleClick(event) {
    if (hoverEffectEnabled) {

        if (hoveredElement) {
            console.log("Sending element to sidePanel:", hoveredElement.outerHTML);
            chrome.tabs.sendMessage({ action: "updatePanel", data: hoveredElement.outerHTML });

            hoveredElement.style.backgroundColor = '';
            hoveredElement = null;
        }

        hoverEffectEnabled = false;
        event.preventDefault();
    }
    event.stopPropagation();
}

document.addEventListener('keydown', function(event) {
    console.log('Keydown event:', event);
    if (event.key === "Escape") {
        console.log('Keydown event: ESCAAAPE');
        hoverEffectEnabled = false;
        if (hoveredElement) {
            hoveredElement.style.backgroundColor = '';
            hoveredElement = null;
        }
    }
});

let hoverHistory = [];
document.addEventListener('wheel', function(event) {
    if (!hoverEffectEnabled || !hoveredElement || !event.shiftKey) return;

    event.preventDefault();

    if (event.deltaY < 0) {
        let parent = hoveredElement.parentNode;
        if (parent && parent !== document.body) {
            hoverHistory.push(hoveredElement);
            updateHoverHighlight(parent);
        }
    } else if (event.deltaY > 0 && hoverHistory.length > 0) {
        let previousElement = hoverHistory.pop();
        updateHoverHighlight(previousElement);
    }
});

function updateHoverHighlight(newElement) {
    if (hoveredElement) {
        hoveredElement.style.backgroundColor = '';
    }
    hoveredElement = newElement;
    hoveredElement.style.backgroundColor = 'rgba(0, 120, 255, 0.2)';
    console.log('Hovering:', hoveredElement);
}

