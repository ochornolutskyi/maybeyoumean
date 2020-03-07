const vocabulary = {
    Cat: ["Dog", "Rat", "bat"],
    Helo: ["hello", "Help", "Hell"],
    heldp: ["help", "held", "hello"]
};
let result = [];
//give text from contenteditable
const prevStateContenteditable = currentElement => {
    let splitContenteditable = currentElement.innerText.split(" ");
    result = splitContenteditable.splice(0, splitContenteditable.length - 1);
};
// FIXME: FOR CHANGING WORD INSIDE THE ELEMENT
const cutCurrentWord = currentElement => {
    let text, currentWord;
    if (currentElement.tagName == "INPUT") {
        text = currentElement.value.split(" ");
    } else {
        text = currentElement.innerText.split(" ");
    }
    currentWord = text[text.length - 1];
    return currentWord;
};
// GIVE IT ON STACKOVERFLOW (x/y coords of caret on window) NOTE: must be only for contenteditable
const getCaretCoords = () => {
    let sel = document.selection,
        range,
        rect;
    let x = 0,
        y = 0;
    if (sel) {
        if (sel.type != "Control") {
            range = sel.createRange();
            range.collapse(true);
            x = range.boundingLeft;
            y = range.boundingTop;
        }
    } else if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0).cloneRange();
            if (range.getClientRects) {
                range.collapse(true);
                if (range.getClientRects().length > 0) {
                    rect = range.getClientRects()[0];
                    x = rect.left;
                    y = rect.top;
                }
            }
            // Fall back to inserting a temporary element
            if (x == 0 && y == 0) {
                let span = document.createElement("span");
                if (span.getClientRects) {
                    // Ensure span has dimensions and position by
                    // adding a zero-width space character
                    span.appendChild(document.createTextNode("\u200b"));
                    range.insertNode(span);
                    rect = span.getClientRects()[0];
                    x = rect.left;
                    y = rect.top;
                    let spanParent = span.parentNode;
                    spanParent.removeChild(span);
                    // Glue any broken text nodes back together
                    spanParent.normalize();
                }
            }
        }
    }
    console.log();
    return { x: x, y: y };
};
//create and append div with offers to body FIXME: NOTE: only for contenteditable now
const createDivOffers = () => {
    let createDivOffers = document.createElement("div");
    createDivOffers.id = "divOffers";
    const marginTop = getCaretCoords(event).y;
    const marginLeft = getCaretCoords(event).x;
    createDivOffers.style.cssText = `width:max-content;
        height: min-content;
        opacity: 0;
        color: #fff;
        font-family: system-ui, "Open Sans";
        transition: opacity 1.5s ease;
        position: absolute;
        top: ${marginTop + 30}px;
        left: ${marginLeft}px;
        z-index: 9999;
        `;
    document.body.appendChild(createDivOffers);
};
//create spans of offers and append to createDivOffers
const createSpanOffer = offer => {
    let createSpanOffer = document.createElement("span");
    createSpanOffer.className = "offer";
    createSpanOffer.innerHTML = offer;
    createSpanOffer.style.cssText = `
        display: inline-block;
        padding: 5px;
        border-radius: 5px;
        font-size: 16px;
        margin-right: 3px;
        background: #2DA192;
        box-sizing: border-box;
        border: 1px solid #fff;
        cursor: pointer
        `;
    document.getElementById("divOffers").appendChild(createSpanOffer);
};
//generate offers from vocabulary
const generateSpanOffers = currentElement => {
    for (let key in vocabulary) {
        if (key == cutCurrentWord(currentElement)) {
            vocabulary[cutCurrentWord(currentElement)].forEach(offer => {
                createSpanOffer(offer);
            });
        }
    }
};
const addDivOffers = currentElement => {
    createDivOffers();
    setTimeout(() => {
        document.getElementById("divOffers").style.opacity = "1";
    }, 100);
    generateSpanOffers(currentElement);
};
//change on a chosen word
const changeValue = (currentElement, offer) => {
    if (currentElement.tagName == "INPUT") {
        result = [];
        let prevValue = currentElement.value.split(" ");
        result = prevValue.splice(0, prevValue.length - 2);
        result.push(offer);
        currentElement.value = result.join(" ") + " ";
        removeDivOffers();
        currentElement.focus();
    } else {
        result.push(offer);
        currentElement.innerHTML = result.join(" ") + "&nbsp;";
        removeDivOffers();
        moveFocusToContentditable(currentElement);
    }
};
const setNewValue = currentElement => {
    document.getElementById("divOffers").childNodes.forEach(child => {
        child.addEventListener("click", offer => {
            changeValue(currentElement, offer.target.innerHTML);
        });
    });
};
//removing offers
const removeDivOffers = () => {
    let removeDiv = document.getElementById("divOffers");
    removeDiv.remove();
};
//GIVE IT. MUST TO LEARN IT
const moveFocusToContentditable = currentElement => {
    const setpos = document.createRange();
    const set = window.getSelection();
    const end = currentElement.innerText.length;
    setpos.setStart(currentElement.childNodes[0], end);
    setpos.collapse(true);
    set.removeAllRanges();
    set.addRange(setpos);
    currentElement.focus();
};
document.addEventListener("keydown", event => {
    if (event.code !== "Space") {
        if (document.getElementById("divOffers")) {
            removeDivOffers();
        }
        return;
    }
    let currentElement = event.target,
        currentWord;
    if (currentElement.getAttribute("contenteditable")) {
        prevStateContenteditable(currentElement);
        currentWord = cutCurrentWord(currentElement);
        //somes
        let chenged = currentElement => {
            let value = currentElement.innerText.split(" ");
            console.log(value);
            console.log(value.indexOf(currentWord));
        };
        chenged(currentElement);
        getCaretCoords(currentElement);
        if (currentWord in vocabulary) {
            addDivOffers(currentElement);
            setNewValue(currentElement);
        }
    } else if (currentElement.tagName == "INPUT") {
        currentWord = cutCurrentWord(currentElement);
        if (currentWord in vocabulary) {
            addDivOffers(currentElement);
            setNewValue(currentElement);
        } else if (currentElement.value) {
            result = [];
            result.push(currentElement.value);
        } else {
            result.push(currentWord);
        }
    }
});
