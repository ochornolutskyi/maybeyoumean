window.onload = () => {
    const vocabulary = {
        Cat: ["Dog", "Rat", "bat"],
        Helo: ["hello", "Help", "Hell"],
        heldp: ["help", "held", "hello"]
    };
    let result = [];
    // searching caret position and cutting text into two parts
    const divisionTextByCaretPosition = currentElement => {
        let firstTextPart, lastTextPart;
        if (currentElement.tagName == "INPUT") {
            firstTextPart = currentElement.value
                .substr(0, event.target.selectionStart)
                .split(" ");
            lastTextPart = currentElement.value.substr(
                event.target.selectionStart
            );
        } else {
            // MUST LEARN IT, COPYPASTE FROM STACKOVERFLOW
            const caretPositionContenteditable = currentElement => {
                let ie =
                    typeof document.selection != "undefined" &&
                    document.selection.type != "Control" &&
                    true;
                let w3 = typeof window.getSelection != "undefined" && true;
                let caretOffset = 0;
                if (w3) {
                    let range = window.getSelection().getRangeAt(0);
                    let preCaretRange = range.cloneRange();
                    preCaretRange.selectNodeContents(currentElement);
                    preCaretRange.setEnd(range.endContainer, range.endOffset);
                    caretOffset = preCaretRange.toString().length;
                } else if (ie) {
                    let textRange = document.selection.createRange();
                    let preCaretTextRange = document.body.createTextRange();
                    preCaretTextRange.expand(currentElement);
                    preCaretTextRange.setEndPoint("EndToEnd", textRange);
                    caretOffset = preCaretTextRange.text.length;
                }
                return caretOffset;
            };
            firstTextPart = currentElement.innerText
                .substr(0, caretPositionContenteditable(currentElement))
                .split(" ");
            lastTextPart = currentElement.innerText.substr(
                caretPositionContenteditable(currentElement)
            );
        }
        return { firstTextPart: firstTextPart, lastTextPart: lastTextPart };
    };
    // cutting of written word
    const cutCurrentWord = currentElement => {
        let text = divisionTextByCaretPosition(currentElement).firstTextPart;
        let currentWord = text[text.length - 1];
        return currentWord;
    };
    //change on a chosen word
    const changeValue = (currentElement, offer, prevValue, lastTextPart) => {
        let caretPosition;
        if (currentElement.tagName == "INPUT") {
            result = [];
            result = prevValue.splice(0, prevValue.length - 1);
            result.push(offer);
            caretPosition = result.join(" ").length + 1;
            currentElement.value = result.join(" ") + " " + lastTextPart;
            removeDivOffers();
            currentElement.focus();
            currentElement.setSelectionRange(caretPosition, caretPosition);
        } else {
            result = [];
            result = prevValue.splice(0, prevValue.length - 1);
            result.push(offer);
            caretPosition = result.join(" ").length + 1;
            currentElement.innerHTML =
                result.join(" ") + "&nbsp;" + lastTextPart;
            removeDivOffers();
            moveFocusToContentditable(currentElement, caretPosition);
        }
    };
    const setNewValue = (currentElement, firstTextPart, lastTextPart) => {
        document.getElementById("divOffers").childNodes.forEach(child => {
            child.addEventListener("click", offer => {
                changeValue(
                    currentElement,
                    offer.target.innerHTML,
                    firstTextPart,
                    lastTextPart
                );
            });
        });
    };
    // GIVE IT ON STACKOVERFLOW (x/y coords of caret on window) NOTE: it is only for contenteditable
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
        return { x: x, y: y };
    };
    //create and append div with offers to body FIXME: lost element position
    const createDivOffers = () => {
        let createDivOffers = document.createElement("div");
        createDivOffers.id = "divOffers";
        document.body.appendChild(createDivOffers);
    };
    //create spans of offers and append to createDivOffers
    const createSpanOffer = offer => {
        let createSpanOffer = document.createElement("span");
        createSpanOffer.className = "spanOffer";
        createSpanOffer.innerHTML = offer;
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
    const positioningDivOffers = currentElement => {
        let marginTop, marginLeft;
        if (currentElement.tagName == "INPUT") {
            marginTop =
                currentElement.getBoundingClientRect().top + window.scrollY;
            marginLeft =
                currentElement.getBoundingClientRect().left + window.scrollX;
        } else {
            marginTop = getCaretCoords(event).y;
            marginLeft = getCaretCoords(event).x;
        }
        const divOffers = document.getElementById("divOffers");
        if (currentElement.style.lineHeight) {
            lineHeight = parseInt(currentElement.style.lineHeight);
        } else lineHeight = 15;
        positioningLeft = () => {
            if (
                marginLeft >=
                document.body.offsetWidth - divOffers.offsetWidth
            ) {
                divOffers.style.left = `${marginLeft -
                    divOffers.offsetWidth}px`;
            } else divOffers.style.left = marginLeft + "px";
        };
        positioningTop = () => {
            if (
                marginTop + divOffers.offsetHeight + lineHeight >=
                document.documentElement.offsetHeight - divOffers.offsetHeight
            ) {
                if (currentElement.tagName == "INPUT") {
                    divOffers.style.top =
                        marginTop -
                        currentElement.offsetHeight -
                        lineHeight +
                        "px";
                } else {
                    divOffers.style.top = marginTop - lineHeight + "px";
                }
            } else {
                if (currentElement.tagName == "INPUT") {
                    divOffers.style.top =
                        marginTop + currentElement.offsetHeight + "px";
                } else {
                    divOffers.style.top = marginTop + lineHeight + "px";
                }
            }
        };
        positioningLeft();
        positioningTop();
    };
    const addDivOffers = currentElement => {
        createDivOffers();
        generateSpanOffers(currentElement);
        positioningDivOffers(currentElement);
        setTimeout(() => {
            document.getElementById("divOffers").style.opacity = "1";
        }, 100);
        let child = document.getElementById("divOffers").children;
        function missClick(event) {
            if (event.target !== child) {
                removeDivOffers();
                window.removeEventListener("click", missClick);
            }
        }
        window.addEventListener("click", missClick);
    };
    //removing offers
    const removeDivOffers = () => {
        let removeDiv = document.getElementById("divOffers");
        removeDiv.remove();
    };
    //GIVE IT. MUST TO LEARN IT
    const moveFocusToContentditable = (currentElement, caretPosition) => {
        const setpos = document.createRange();
        const set = window.getSelection();
        const end = caretPosition;
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
        let firstTextPart = divisionTextByCaretPosition(currentElement)
                .firstTextPart,
            lastTextPart = divisionTextByCaretPosition(currentElement)
                .lastTextPart;
        if (currentElement.getAttribute("contenteditable")) {
            // prevStateContenteditable(currentElement);
            currentWord = cutCurrentWord(currentElement);
            getCaretCoords(currentElement);
            if (currentWord in vocabulary) {
                addDivOffers(currentElement);
                setNewValue(currentElement, firstTextPart, lastTextPart);
            }
        } else if (currentElement.tagName == "INPUT") {
            currentWord = cutCurrentWord(currentElement);
            if (currentWord in vocabulary) {
                addDivOffers(currentElement);
                setNewValue(currentElement, firstTextPart, lastTextPart);
            } else if (currentElement.value) {
                result = [];
                result.push(currentElement.value);
            } else {
                result.push(currentWord);
            }
        }
    });
};
