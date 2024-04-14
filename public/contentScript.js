console.log('contentScript.js loaded');


let hoverEffectEnabled = false;
let hoveredElement = null;
let selectedElements = [];


document.body.addEventListener('mouseover', function(event) {
    if (hoverEffectEnabled) {

        if (hoveredElement) {
            let index = selectedElements.indexOf(hoveredElement);
            // Only reset the background color if the hovered element isn't in selectedElements
            if (index === -1) {
                hoveredElement.style.backgroundColor = '';
            }
        }

        hoveredElement = event.target;
        hoveredElement.style.backgroundColor = 'rgba(0, 120, 255, 0.2)';
        event.preventDefault();
        event.stopPropagation();
    }
});

document.body.addEventListener('mouseout', function(event) {
    if (hoverEffectEnabled) {

        if (hoveredElement && !selectedElements.includes(hoveredElement)) {
            hoveredElement.style.backgroundColor = '';
        }
        event.preventDefault();
        event.stopPropagation();
    }
});

document.body.addEventListener('click', function(event) {
    if (hoverEffectEnabled) {
        if (hoveredElement && !selectedElements.includes(hoveredElement)) {
            selectedElements.push(hoveredElement);
            hoveredElement.style.backgroundColor = 'rgba(0, 120, 255, 0.2)';
            chrome.runtime.sendMessage({ action: "updatePanel", data: hoveredElement.outerHTML });
        }
        event.preventDefault();
        event.stopPropagation();
    }
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action === "clearSelection") {
            for(let i = 0; i < selectedElements.length; i++){
                selectedElements[i].style.backgroundColor = '';
            }
            selectedElements = [];
            hoveredElement = null;
            hoverEffectEnabled = false;
        }
    });

document.body.addEventListener('keydown', function(event) {
    // On "Enter" key press, disable hover effect and send selected elements
    if (hoverEffectEnabled) {
        if (event.code === 'Enter') {

            hoverEffectEnabled = false;

            for(let i = 0; i < selectedElements.length; i++){
                selectedElements[i].style.backgroundColor = '';
            }

            selectedElements = [];
            hoveredElement.style.backgroundColor = '';
            hoveredElement = null;

        }
        event.preventDefault();
        event.stopPropagation();
    }
});


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

