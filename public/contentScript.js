console.log('contentScript.js loaded');


let hoverEffectEnabled = false;
let hoveredElement = null;

// MutationObserver to observe changes within the page and filter content accordingly
function handleMouseOver(event) {
    if (hoverEffectEnabled) {
        hoveredElement = event.target;
        hoveredElement.style.backgroundColor = 'rgba(0, 120, 255, 0.2)'; // highlight new hovered element
    }
}

function handleMouseOut(event) {
    if (hoverEffectEnabled && hoveredElement) {
        hoveredElement.style.backgroundColor = ''; // reset background color
        hoveredElement = null;
    }
}

document.addEventListener('mouseover', handleMouseOver, false);
document.addEventListener('mouseout', handleMouseOut, false);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
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
        hoveredElement.style.backgroundColor = ''; // Reset background color after sending
        hoverEffectEnabled = false; // Optionally, reset hover effect
    } else if (request.action === "setApiKey") {
        console.log("requesting api key");
        chrome.storage.sync.get(['key'], function(result) {
            // If the key does not exist, initialize it.

            console.log("i would like to set the key please !");
            if (!result.key || result.key === null) {
            // if (Object.keys(result).length === 0 && result.constructor === Object) {
                apiKey = prompt("Please enter your OpenAI API key:", "");
                chrome.storage.sync.set({'key': apiKey}, function() {
                    console.log('Key is set to ' + apiKey);
                });
            } else {
                console.log('Value currently is ' + result.key);
            }
        });
    }
});


document.addEventListener('click', handleClick, false);

function handleClick(event) {
    if (hoverEffectEnabled) {

        if (hoveredElement) {
            console.log("Sending element to sidePanel:", hoveredElement.outerHTML);
            // chrome.runtime.sendMessage( { action: "updatePanel", data: "New data to display" });
            chrome.tabs.sendMessage({ action: "updatePanel", data: hoveredElement.outerHTML });

            // let message = { action: "sendToSidePanel", data: hoveredElement.outerHTML };
            // chrome.runtime.sendMessage(message);
            hoveredElement.style.backgroundColor = ''; // Reset background color
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
            hoveredElement.style.backgroundColor = ''; // Reset background color
            hoveredElement = null;
        }
    }
});

let hoverHistory = [];
document.addEventListener('wheel', function(event) {
    if (!hoverEffectEnabled || !hoveredElement || !event.shiftKey) return; // Check if hover mode is active, an element is selected, and Shift key is pressed

    event.preventDefault(); // Prevent the default scroll action to better control the interaction

    if (event.deltaY < 0) {
        // Shift + Scroll Up - Move to the outer element (parentNode)
        let parent = hoveredElement.parentNode;
        if (parent && parent !== document.body) { // Ensure we don't select the body or go beyond
            hoverHistory.push(hoveredElement); // Add current element to the history before moving to the parent
            updateHoverHighlight(parent);
        }
    } else if (event.deltaY > 0 && hoverHistory.length > 0) {
        // Shift + Scroll Down - Move back to the previous element in the hover history
        let previousElement = hoverHistory.pop(); // Remove the last element from the history and move to it
        updateHoverHighlight(previousElement);
    }
});

function updateHoverHighlight(newElement) {
    if (hoveredElement) {
        hoveredElement.style.backgroundColor = ''; // Reset current element's background
    }
    hoveredElement = newElement;
    hoveredElement.style.backgroundColor = 'rgba(0, 120, 255, 0.2)'; // Highlight the new element
    console.log('Hovering:', hoveredElement); // Optional: for debugging to see the currently hovered element
}

