/**
 * This is the entry point for the client-side/browser-based side of the application.
 * All of this work is delegated to individual small focused modules.
 */
function storeVariables(args) {
    substitution.util.level = args['level'];
    substitution.util.input = args['input'];
    substitution.util.lang = args['lang'];
    substitution.util.original_hash = args['original_hash'];
    substitution.util.difficulty = args['difficulty'];
    substitution.util.foreign = args['foreign'];
    substitution.util.nextUrl = args['next'];
    substitution.util.insertURL = args['insertURL'];
    substitution.util.staticDir = args['staticDir'];
    substitution.util.baseURL = args['baseURL'];
}

function load() {
    substitution.ui.loadFreeLetters();
    substitution.ui.loadEncryptedLetters();
    substitution.ui.loadSolvedMessageContainer();
    substitution.ui.loadFrequencyDisplay();
    substitution.event.registerFreeLetterHoverEvent();
    substitution.event.registerLetterInputHoverEvent();
    substitution.event.registerFrequencyHoverEvent();
    substitution.event.registerFreeLetterDraggableEvent();
    substitution.event.registerWordLetterClickEvent();
    substitution.event.registerWordLetterDroppableEvent();
    substitution.event.registerWordInputChangeEvent();
    substitution.event.registerNavBarButtonEvent();
    loadChart();
}