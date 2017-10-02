/**
 * Created by manja on 18.6.2017.
 */
/* crypto.js - controls main logic flow and functinality for the cryptogram helper
 *
 * Author: Colin Heffernan
 * Created: Dec 14 2013
 *
 */

/* Global variables to be used by all components */
var dictionary = null; // maps each letter to its substitution
var reverseDict = null; // maps each substitution to the original letter
var freeLetters = null; // letters remaining and available for substitution
var cryptedMessage = null; // original message input by user to the message box
var frequencyTable = null; // table of letter frequencies in the original message
var ALPHABET = null; // array containing the 25 letters in the english alphabet for resetting
var keyvalues = null; //array containing values to be subbed from ciphered message
var subs = null;  //maps letter to its place in alphabet
var mod = 3 ;  //keyword length

function stripBlanks(fld) {
    var result = "";
    var c = 0;
    for (i=0; i < fld.length; i++) {
        if (fld.charAt(i) != " " || c > 0) {
            result += fld.charAt(i);
            if (fld.charAt(i) != " ") c = result.length;
        }
      }
    return result.substr(0,c);
}

/*
 * initialize - called when the begin button is pressed
 */
var ind = null;

function initialize(st){
    $('#begin').each(function() {
        $(this).remove();
    });
    ind = st;
    dictionary = new Array();
    reverseDict = new Array();
    frequencyTable = new Array();
    ALPHABET = new Array(); // constant alphabet array
    freeLetters = new Array();
    keyvalues = new Array();
    subs = new Array();
    addResetButton();
	addNextButton();
    var A = "A".charCodeAt(0);
    for (var i = 0; i < 26; i++){ // fill alphabet array
        var newChar = String.fromCharCode(A + i);
        subs[newChar] = i;
        if(lang == "sl" && !foreign && (newChar === 'Q' || newChar === 'W' || newChar === 'X' || newChar === 'Y'))    continue;
        ALPHABET.push(newChar);
        freeLetters[newChar] = true;
        if (lang == "sl" || foreign) {
            if(newChar === 'C')  ALPHABET.push('Č');
            if(newChar === 'S')  ALPHABET.push('Š');
            if(newChar === 'Z')  ALPHABET.push('Ž');
        }
    }
    if (lang == "sl" || foreign) {
        freeLetters['Č'] = true;
        freeLetters['Š'] = true;
        freeLetters['Ž'] = true;
    }
    for (var i = 0; i < input.length; i++) {
        keyvalues[i] = 0;
    }
    //window.onresize = updateEssentials;

    updateEssentials(); // adds the letter selection, message display, and frequency tables
}



function updateEssentials(){
    frequencyTable = new Array(); // frequencyTable will be handled by the getMessageDisplay method
    cryptedMessage = getCryptedMessage(); // get the latest version of the input crypted message stored in an array of words
    var coreLogic = document.getElementById("coreLogic");
    coreLogic.innerHTML = "";
    coreLogic.appendChild(newFreeLetterDisplay());
    coreLogic.appendChild(newLine());
    coreLogic.appendChild(newMessageDisplay());
    coreLogic.appendChild(newLine());
    //coreLogic.appendChild(newFrequencyDisplay());

    var geslo = document.getElementById("inputField");
    //geslo.value = "";
    var wordDisplay = document.getElementById("geslo");
    wordDisplay.appendChild(newKeyphrase());

    if(difficulty == 'easy'){
        document.getElementById("add_button").disabled = true;
        document.getElementById("del_button").disabled = true;
    }
    else{
        document.getElementById("add_button").disabled = false;
        document.getElementById("add_button").disabled = false;
    }

}

function updateEssentialsSecondly(){
    var coreLogic = document.getElementById("coreLogic");
    coreLogic.innerHTML = "";
    coreLogic.appendChild(newFreeLetterDisplay());
    coreLogic.appendChild(newLine());
    coreLogic.appendChild(newMessageDisplay());
    coreLogic.appendChild(newLine());
    //coreLogic.appendChild(newFrequencyDisplay());
    //console.log("works");

    var geslo = document.getElementById("inputField");
    //geslo.value= "";
    var wordDisplay = document.getElementById("geslo");
    wordDisplay.appendChild(newKeyphrase());
/*
    if(difficulty == 'easy'){
        document.getElementById("add_button").disabled = true;
        document.getElementById("del_button").disabled = true;
    }
    else{
       // document.getElementById("add_button").disabled = false;
       // document.getElementById("add_button").disabled = false;
    }*/
    updateMessage();

}

function bySortedValue(obj) {
    var tuples = [];
    var out = Array();

    for (var key in obj) tuples.push([key, obj[key]]);

    tuples.sort(function(a, b) { return a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0 });

    var length = tuples.length;
    while (length--) out[tuples[length][0]] = tuples[length][1];
    return out;
}

// returns the message as an array of words for displaying the message and controlling text wrapping
function getCryptedMessage(){
    //$('#messageOutput').val("");
	$("#messageOutput").html("");
    var crypt = new Array(); // array of strings each representing a word

    $('#messageOutput').append(input);
    var i = 0; // index of the current character being investigated
    var currentWord = "";
    while (i < input.length){ // loop through every letter in the input
        var currentCharacter = input.charAt(i).toUpperCase();//.trim()-only deal with upper case letters (withou white space)
        if(ind === 3){
            currentCharacter = currentCharacter.trim().split(',').join("");
        }
        appendFrequency(currentCharacter); // add the current Letter to the frequency table

        if (!(currentCharacter == ' ' || currentCharacter == '\n')){
            currentWord += currentCharacter; // add the current character to the current word
        }
        else{ // if we have a reached a space or end of the line
            if (!currentWord == ""){ // don't add empty words
                crypt.push(currentWord);
            }
            currentWord = ""; // reset the currentWord (will not contain the current space)
        }
        if (i == input.length - 1){ // if we have reached the end of the file
            if (!currentWord == ""){ // don't add empty words
                crypt.push(currentWord);  // add the last word in
            }
            currentWord = ""; // reset the currentWord (will not contain the current space)
        }
        i++;
    }
    frequencyTable = bySortedValue(frequencyTable);
    return crypt;
}

// returns a div element full of the draggable freeLetters
function newFreeLetterDisplay(){
    var freeLetterDisplay = document.createElement("div");
    freeLetterDisplay.setAttribute("id", "freeLetterDisplay");
    for(var i = 0; i < ALPHABET.length; i++){
        if (freeLetters[ALPHABET[i]]) {
            freeLetterDisplay.appendChild(newDraggableFreeLetter(ALPHABET[i]));
        }
    }
    return freeLetterDisplay;
}

// returns the div element containing the entire display of original message beneath updated message containing substitutions
function newMessageDisplay(){
    var messageDisplay = document.createElement("div");
    messageDisplay.setAttribute("id", "messageDisplay");
    for (var i = 0; i < cryptedMessage.length; i++){
        var currentWord = cryptedMessage[i]; // current letter being examined
        //console.log(currentWord);
        messageDisplay.appendChild(newWordDisplay(currentWord));
        if (i < cryptedMessage.length - 1){ // add a space at the end of each word except for the last
            messageDisplay.appendChild(newSpace());
        }
    }
    return messageDisplay;
}

function newFrequencyDisplay(){
    var frequencyDisplay = document.createElement("div");
    frequencyDisplay.setAttribute("id", "frequencyDisplay");
    var index = 0;
    for (var letter in frequencyTable){
        index ++;
        frequencyDisplay.appendChild(newFrequency(letter, frequencyTable[letter]));
    }
    return frequencyDisplay;
}

// helper methods for the three essential methods above

// returns a div element for the current word
function newWordDisplay(word){
    var wordDisplay = document.createElement("div");
    wordDisplay.setAttribute("class", "wordDisplay");
    for (var i = 0; i < word.length; i++){ // index through the current word
        var currentLetter = word.charAt(i);
        if (isLetter(currentLetter)){ // if the current character is A-Z
            //wordDisplay.appendChild(newEditableLetterDisplay(currentLetter)); // letterTable which can be modified for substitutions
            wordDisplay.appendChild(newUndraggableFreeLetter(currentLetter));
        }
        else{ // if the current character is not A-Z
            wordDisplay.appendChild(newUneditableCharacterDisplay(currentLetter)); // letterTable which can not be modified
        }
    }
    return wordDisplay;
}

// returns a div element displaying the crypted letter from the original message and its editable substitute
function newEditableLetterDisplay(letter){
    var letterDisplay = document.createElement("div");
    letterDisplay.setAttribute("class", "letter");
    var top = document.createElement("div");
    top.setAttribute("ondragover", "allowDrop(event);"); // permit dragging and dropping from this element
    top.setAttribute("ondrop", "letterDraggedIntoMessage(event);"); // permit dragging and dropping with this letter
    top.setAttribute("ondragleave", "letterDraggedOutOfMessage(event);");
    top.setAttribute("class", "letterHolder");
    top.setAttribute("value", letter);
    top.appendChild(newEditableMessageLetter(letter));
    letterDisplay.appendChild(top);
    //~ letterDisplay.appendChild(newLine());
    //~ var bottom = document.createElement("div");
    //~ bottom.setAttribute("class", "letterHolder");
    //~ bottom.appendChild(cryptedCharacter(letter));
    //~ letterDisplay.appendChild(bottom);
    return letterDisplay;
}

// returns a div element displaying the crypted letter from the original message and its editable substitute
function newUneditableCharacterDisplay(letter){
    var letterDisplay = document.createElement("div");
    letterDisplay.setAttribute("class", "letter");
    var top = document.createElement("div");
    top.setAttribute("class", "letterHolder");
    top.appendChild(newUneditableMessageCharacter(letter));
    letterDisplay.appendChild(top);
    //~ letterDisplay.appendChild(newLine());
    /*var bottom = document.createElement("div");
    bottom.setAttribute("class", "letterHolder");
    bottom.appendChild(cryptedCharacter(letter));
    letterDisplay.appendChild(bottom);*/
    return letterDisplay;
}

// returns a div element for the uneditable non A-Z characters in a messageDisplay character table's top cell
function newUneditableMessageCharacter(character){ // div element to be in the top cell of each letter display
    var letterDisplay = document.createElement("div");
    letterDisplay.setAttribute("class", "uneditableCharacter");
    letterDisplay.setAttribute("value", character);
    letterDisplay.textContent = character;
    return letterDisplay;
}

// returns a draggable and editable letter to be added for A-Z characters in the messageDisplay letter table's top cell
function newEditableMessageLetter(letter){
    var letterDisplay = document.createElement("input");
    letterDisplay.setAttribute("original", letter); // original attribute holds the letter in the original crypted message
    letterDisplay.setAttribute("class", "decryptedCharacter");
    letterDisplay.setAttribute("draggable", true);
    letterDisplay.setAttribute("ondragstart", "letterDraggedIntoMessage(event);");
    letterDisplay.setAttribute("onmouseenter", "highlightLetter(this);");
    letterDisplay.setAttribute("placeholder", " ");
    if (letter in dictionary && dictionary[letter] != 'undefined'){
        letterDisplay.setAttribute("value", dictionary[letter]);
        //letterDisplay.textContent = dictionary[letter];
    }
    else{
        letterDisplay.setAttribute("value", "");
        //letterDisplay.textContent = "";
    }
    return letterDisplay;
}

// returns a div element for the characters in the original crypted message
function cryptedCharacter(character){
    var characterDisplay = document.createElement("div");
    characterDisplay.setAttribute("class", "cryptedCharacter");
    characterDisplay.setAttribute("value", character);
    characterDisplay.textContent = character;
    return characterDisplay;
}

//handle all the dragging events

function allowDrop(event){
    event.preventDefault();
}

// return a letter to the free letters table when it is dragged out of the message
function letterDraggedOutOfMessage(ev){
    event.preventDefault();
    var substitution = event.dataTransfer.getData("Text"); // value of the letter being dragged
    var original = reverseDict[substitution];
    if (isLetter(substitution) && !freeLetters[substitution.toUpperCase()]){ // only add the letter to the table if it is not already there
        freeLetters[substitution.toUpperCase()] = true;
    }
    delete dictionary[original];
    delete reverseDict[substitution];
    updateEssentialsSecondly(); // rebuild the free letters tables
}

// substitute accordinly when a freeLetter is dragged into a letter slot in the message display
function letterDraggedIntoMessage(event){
    event.preventDefault();
    var substitution = event.dataTransfer.getData("Text"); // value of the letter being dragged
    var original = event.currentTarget.getAttribute("value"); // cell that the letter is being dragged towards
    //event.currentTarget.setAttribute("value", substitution); // send the substitution value
    substitute(original, substitution);
    if(original > 2)
        updateKeyword();
    //event.dataTransfer.setData("Text", event.currentTarget.getAttribute("value")); // send the substitution value
}

function letterDragged(event){ // tell the recipient of this letter what letter is coming
    event.dataTransfer.setData("Text", event.currentTarget.getAttribute("value")); // send the substitution value
}

// returns a draggable div element to be inserted into the freeLettersDisplay
function newDraggableFreeLetter(letter){
    var letterDisplay = document.createElement("div");
    letterDisplay.textContent = letter.toLowerCase();
    letterDisplay.setAttribute("value", letter.toLowerCase());
    letterDisplay.setAttribute("class", "decryptedCharacter");
    letterDisplay.setAttribute("draggable", true);
    letterDisplay.setAttribute("ondragstart", "letterDragged(event);");
    return letterDisplay;
}

// returns an undraggable div element to be in the message @M
function newUndraggableFreeLetter(letter){
    var letterDisplay = document.createElement("div");
    letterDisplay.textContent = letter.toUpperCase();
    letterDisplay.setAttribute("value", letter.toUpperCase());
    letterDisplay.setAttribute("class", "decryptedCharacter");
    letterDisplay.setAttribute("draggable", false);
    letterDisplay.setAttribute("original", letter); // original attribute holds the letter in the original crypted message

    return letterDisplay;
}

// returns keyphrase div
function newKeyphrase(){
    var wordDisplay = document.getElementById("geslo").getElementsByClassName("wordDisplay")[0];
    //wordDisplay.setAttribute("class", "wordDisplay");
    wordDisplay.innerHTML = "";
    /*var wlen = 4;
    if (difficulty == 'easy' || difficulty == 'medium') wlen = 3;//hc potem bo dolzina kp*/
    for (var i = 0; i < mod; i++){ // index through the current word
        wordDisplay.appendChild(newEditableLetterDisplay(i)); // letterTable which can be modified for substitutions
    }
    /*mod = wlen;*/
    return wordDisplay;
}

function addKeyLetter(){
     var keyphrase = document.getElementById("geslo").getElementsByClassName("wordDisplay")[0];
     keyphrase.appendChild(newEditableLetterDisplay(keyphrase.getElementsByClassName("letter").length));
     mod++;
     if(mod > 1)
        document.getElementById("del_button").disabled = false;

     if(mod >= 15)
        document.getElementById("add_button").disabled = true;
     //updateEssentialsSecondly();
     updateKeyword();
     return keyphrase;
}

function deleteKeyLetter(let){
     if(let == -1)
     var keyphrase = document.getElementById("geslo").getElementsByClassName("wordDisplay")[0];
     //delete(keyphrase.getElementsByClassName("letter")[(keyphrase.getElementsByClassName("letter").length)-1]);
     for (var i = mod-'0'; i < input.length; i+=mod-'0') {
        keyvalues[i] = 0;   //repeated keyword --> keyword[rem]
        //console.log(i + " " + keyvalues[i] + " " + substitution.toUpperCase());
     }
     //updateKeyword();
     if(dictionary.length >= mod)
        dictionary.pop();
     mod--;
     if(mod <= 1)
        document.getElementById("del_button").disabled = true;

     if(mod < 15 )
        document.getElementById("add_button").disabled = false;
     //updateEssentialsSecondly();
     updateKeyword();
     return keyphrase;
}
var test;
function updateKeyword(){
    var keyphrase = document.getElementById("geslo").getElementsByClassName("wordDisplay")[0];
    for(var let = 0; let < mod; let++){
        var substitution = keyphrase.getElementsByClassName("letter")[let].getElementsByClassName("decryptedCharacter")[0].value;
        var decrypt = "";
        var c;
        var rem;
        var cx;
        var ind_sw;
        test = substitution;
        //console.log(let + " " + substitution);
        if( let == undefined || let == 'undefined'|| substitution == undefined || substitution == 'undefined'|| substitution == '' || substitution == ' '){
            for (var i = let-'0'; i < input.length; i+=mod-'0') {
                keyvalues[i] = 0;   //repeated keyword --> keyword[rem]
                //console.log(i + " " + keyvalues[i] + " " + substitution.toUpperCase());
            }
             delete dictionary[let];
             delete keyphrase.getElementsByClassName("letter")[let];
        }
        else
            for (var i = let-'0'; i < input.length; i+=mod-'0') {
                keyvalues[i] = subs[substitution.toUpperCase()];   //repeated keyword --> keyword[rem]
                //console.log(i + " " + keyvalues[i] + " " + substitution.toUpperCase());
            }
        //to not count a space as one of the letters while switching
        var keyind = 0;
        for (var i = 0; i < input.length; i++) {

            c = input.charAt(i);
            if(!isLetter(c) || c == " "){
                decrypt += c;
                continue;
            }
            //console.log(c + " " + keyvalues[keyind] + " " + i+ " " + keyind);
            cx = subs[c.toUpperCase()];
            ind_sw = cx-keyvalues[keyind];
            if (ind_sw < 0)
                ind_sw += ALPHABET.length;

            decrypt += ALPHABET[ind_sw];
            keyind++;
        }
    }
    $("#messageOutput").html("");
    $('#messageOutput').append(decrypt);
    console.log(dictionary);
    updateEssentialsSecondly();
}

function updateMessage(){
    //console.log(decrypt);
    //console.log(input);
    var msg = document.getElementById("messageOutput").innerHTML;
    //console.log(msg);
    var i_msg = 0;
    for (var i = 0; i < msg.length; i++) {

        c =msg[i];
        if(isLetter(c)){
            document.getElementById("messageDisplay").getElementsByClassName("decryptedCharacter")[i_msg].setAttribute("value", c);
            document.getElementById("messageDisplay").getElementsByClassName("decryptedCharacter")[i_msg].innerHTML = c;
            i_msg++;
        }
    }
}

function highlightLetter(element){ //po indexih
    var allUnh = document.getElementById("messageDisplay").getElementsByClassName("highlightedLetter");
    for (var i = 0; i < allUnh.length; i++){
        currElement = allUnh[i];
        if (currElement.getAttribute("class") == "letterFrequency" || currElement.getAttribute("class") == "letterFrequencySolved") {
            continue;
        }
        //currElement.removeAttribute("class");
        currElement.setAttribute("class", "decryptedCharacter");
        currElement.class = "decryptedCharacter";
        currElement.removeAttribute("id"); // tell the program which letter is highlighted
    }
    var toHighlight = getElementByAttributeValue("original", element.getAttribute("original"))[0];
    var orig = element.getAttribute("original");
    if (!(toHighlight.getAttribute("class") == "letterFrequency" || toHighlight.getAttribute("class") == "letterFrequencySolved")) {
        toHighlight.setAttribute("class", "highlightedLetter");
        toHighlight.setAttribute("id", "highlighted"); // tell the program which letter is highlighted
        toHighlight.setAttribute("onmouseleave", "unhighlightLetter(this);");
    }

    //var allWords = document.getElementById("messageDisplay").getElementsByClassName("wordDisplay");
    var allElements = document.getElementById("messageDisplay").getElementsByClassName("decryptedCharacter");

    for (var i = orig-'0'; i < allElements.length; i+=(mod-1)){
        currElement = allElements[i];
        //console.log("highlight: " + i + " " + currElement.getAttribute("original") + " " + currElement.getAttribute("class"));
        if (currElement.getAttribute("class") == "letterFrequency" || currElement.getAttribute("class") == "letterFrequencySolved") {
            continue;
        }
        currElement.setAttribute("class", "highlightedLetter");
        currElement.setAttribute("id", "highlighted"); // tell the program which letter is highlighted
        currElement.innerHTML = currElement.getAttribute("original");
        //currElement.setAttribute("onmouseleave", "unhighlightLetter(this);");
    }
    //document.onkeypress = keyPressedWhileHighlighted;
}

// unhighlight the letter when the mouse exits
function unhighlightLetter(element){
    //document.onkeypress = null;
    var toHighlight = getElementByAttributeValue("original", element.getAttribute("original"))[0];
    if (!(toHighlight.getAttribute("class") == "letterFrequency" || toHighlight.getAttribute("class") == "letterFrequencySolved")) {
        //toHighlight.removeAttribute("class");
        toHighlight.setAttribute("class", "decryptedCharacter");
        toHighlight.removeAttribute("id");
    }
    var orig = element.getAttribute("original");
    var allWords = document.getElementById("messageDisplay").getElementsByClassName("wordDisplay");
    var allElements = document.getElementById("messageDisplay").getElementsByClassName("highlightedLetter");
    //console.log(allElements.length + allElements);
    var l = allElements.length;
    for (var i = 0; i <l; i++){
        //console.log("loops" + i);
        currElement = allElements[0];
        if (currElement.getAttribute("class") == "letterFrequency" || currElement.getAttribute("class") == "letterFrequencySolved") {
            continue;
        }
        //currElement.removeAttribute("class");
        //console.log("unhighlight: " + i + " " + currElement.getAttribute("original") + " " + currElement.getAttribute("class"));

        currElement.setAttribute("class", "decryptedCharacter");
        currElement.class = "decryptedCharacter";
        currElement.removeAttribute("id"); // tell the program which letter is highlighted
        currElement.innerHTML = currElement.getAttribute("value");
    }
    for(var word = 0; word < allWords.length; word++){
        var letters = allWords[word].getElementsByClassName("highlitedLetter");
        for(var l = 0; l < letters.length; l++){
            letters[l].setAttribute("class", "decryptedCharacter");
            letters[l].innerHTML = currElement.getAttribute("value");
        }
    }
}

// function to be called when a key is pressed while a letter is highlighted
function keyPressedWhileHighlighted(evt) {
  evt = evt || window.event;
  var charCode = evt.charCode || evt.keyCode;
  var substitution = String.fromCharCode(charCode).toLowerCase();
  var lettersToChange = document.getElementsByClassName("highlightedLetter");
  var original = lettersToChange[0].getAttribute("original"); // only need the original from one of the elements
  substitute(original, substitution);
};


// function to be called when a keyword is changed
function keywordChanged(evt) {
  evt = evt || window.event;
  var charCode = evt.charCode || evt.keyCode;
  var substitution = String.fromCharCode(charCode).toLowerCase();
  var lettersToChange = document.getElementsByClassName("highlightedLetter");
  var original = lettersToChange[0].getAttribute("original"); // only need the original from one of the elements
  substitute(original, substitution);
};

// carries out a suggested substitution
function substitute(original, substitution){
    var currentSub = dictionary[original];
    var currentOriginal = reverseDict[substitution];
    delete dictionary[currentOriginal]; // the substituted value now stands for something different if at all
    delete reverseDict[currentSub]; // always removing the current substitution no matter what
    if (currentSub != null && !freeLetters[currentSub.toUpperCase()]){ // only return the letter to the free letters table if it is not  already there
        freeLetters[currentSub.toUpperCase()] = true;
    }
    if (isLetter(substitution)){
        //deleteFreeLetter(substitution);
        dictionary[original] = substitution;
        //reverseDict[substitution] = original;
    }
    else{ // if any other character is typed, delete the dictionary entry
        delete dictionary[original];
    }

    var decrypt = "";
    var c;
    var rem;
    var cx;
    var ind_sw;

    //console.log(original + " " + substitution);
    //var newChar = String.fromCharCode("A".charCodeAt(0) + i);

    for (var i = original-'0'; i < input.length; i+=mod-'0') {
        keyvalues[i] = subs[substitution.toUpperCase()];   //repeated keyword --> keyword[rem]
        //console.log(i + " " + keyvalues[i] + " " + substitution.toUpperCase());
    }
    //to not count a space as one of the letters while switching
    var keyind = 0;
    var i_msg = 0;
    for (var i = 0; i < input.length; i++) {

        c = input.charAt(i);
        if(!isLetter(c) || c == " "){
            decrypt += c;
            //msg[i_msg].value = c;
            //i_msg++;
            continue;
        }
        //console.log(c + " " + keyvalues[keyind] + " " + i+ " " + keyind);
        cx = subs[c.toUpperCase()];
        ind_sw = cx-keyvalues[keyind];
        if (ind_sw < 0)
            ind_sw += ALPHABET.length;

        decrypt += ALPHABET[ind_sw];
        keyind++;
    }
    $("#messageOutput").html("");
    $('#messageOutput').append(decrypt);

    updateEssentialsSecondly();
    //var msg =  document.getElementById("messageDisplay").getElementsByClassName("decryptedCharacter");
    //console.log(msg);
    /*console.log(decrypt);
    console.log(input);
    var i_msg = 0;
    for (var i = 0; i < decrypt.length; i++) {

        c = decrypt[i];
        if(isLetter(c)){
            document.getElementById("messageDisplay").getElementsByClassName("decryptedCharacter")[i_msg].setAttribute("value", c);
            document.getElementById("messageDisplay").getElementsByClassName("decryptedCharacter")[i_msg].innerHTML = c;
            i_msg++;
        }
    }*/
}

//check matching with original
check = function(){
    shash = hash(document.getElementById("messageOutput").value);
    console.log(shash + " " + hashcode);
    if(shash == hashcode)
        return true;
    else return false;
}

//simple hash - source: http://www.erlycoder.com/49/javascript-hash-functions-to-convert-string-into-integer-hash-
hash = function(str){
    var hash = 0;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        if(char == ' ') continue;
        hash = ((hash<<5)-hash)+char;
        console.log(hash);
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}


// resets all relevent data in the webpage
function reset(){
    for (var i = 0; i < ALPHABET.length; i++) {
        freeLetters[ALPHABET[i]] = true;
    }
    dictionary = new Array();
    reverseDict = new Array();
    updateEssentialsSecondly();
}

// go to next cryptogram
function next(){
	initialize(ind);
}

// handles a letter's frequency value in the frequency table
function appendFrequency(letter){
    if (isLetter(letter)){ // only worry about characters that are letters
        if (frequencyTable[letter] != null){
            frequencyTable[letter] ++;
        }
        else{
            frequencyTable[letter] = 1;
        }
    }
}

// deletes a letter from the freeLetters array when it is substituted
function deleteFreeLetter(letter){
    letter = letter.toUpperCase();
    freeLetters[letter] = false;
}

// adds the reset button to the buttons panel
function addResetButton(){
    var buttons = document.getElementById("buttons");
    if (buttons.getElementsByTagName("button").length <= 1){
        buttons.appendChild(resetButton());
    }
}

// adds the next button to the buttons panel for new cryptogram
function addNextButton(){
    var buttons = document.getElementById("buttons");
    if (buttons.getElementsByTagName("button").length <= 1){
        buttons.appendChild(nextButton());
    }
}

// returns a reset button to be appended to the buttons panel
function resetButton(){
    var button = document.createElement("button");
    button.setAttribute("value", "Reset");
    button.setAttribute("id", "begin");
    button.setAttribute("class","btn btn-default btn-bg");
    button.setAttribute("onclick", "reset();");
    button.textContent = "Začni znova";
    return button;
}

// returns a next button to be appended to the buttons panel
function nextButton(){
    var button = document.createElement("button");
    button.setAttribute("value", "Next");
    button.setAttribute("id", "next");
    button.setAttribute("class","btn btn-default btn-bg");
    button.setAttribute("onclick", "location.href = next;");
    button.textContent = "Naslednji";
    return button;
}

// returns an element with a br tag
function newLine(){
    return document.createElement("br");
}

// returns an empty div element to represent a space in the messageDisplay
function newSpace(){
    var letterDisplay = document.createElement("div");
    letterDisplay.setAttribute("class", "letter");
    return letterDisplay;
}

// returns a list of all
function getElementByAttributeValue(attribute, value)
{
  var allElements = document.getElementsByTagName('*');
  var matches = new Array();
  for (var i = 0; i < allElements.length; i++){
    if (allElements[i].getAttribute(attribute) == value)
    {
      matches.push(allElements[i]);
    }
  }
    return matches;
}

/*
 * isLetter - determines whether a letter is between A and Z
 * Note that every letter passed as an argument will be changed to uppercase
 */
function isLetter(letter){
    letter = letter.toUpperCase();
    return (letter.charCodeAt(0) < 91 && letter.charCodeAt(0) >= 65 || letter === 'Č' || letter === 'Š' || letter === 'Ž');
}

function code(letter){
    return letter.charCodeAt(0);
}

