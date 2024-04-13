console.log('contentScript.js loaded');


let hoverEffectEnabled = false;
let hoveredElement = null;

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
  if (request.cmd === 'replaceText') {
    console.log('Replacing text');
    let bodyText = document.body.innerHTML;
    bodyText = bodyText.replace(/pain au chocolat/gi, 'chocolatine');
    document.body.innerHTML = bodyText;
  } else if (request.action === "enableHoverEffect") {
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
  }
});


document.addEventListener('click', handleClick, false);

function handleClick(event) {
    if (hoverEffectEnabled) {
        hoverEffectEnabled = false; // Disable hover effect

        if (hoveredElement) {
            hoveredElement.style.backgroundColor = ''; // Reset background color
            hoveredElement = null;
        }
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

