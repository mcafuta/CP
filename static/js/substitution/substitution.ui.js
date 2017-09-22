/* crypto.js - controls main logic flow and functinality for the cryptogram helper
 *
 * Author: Colin Heffernan
 * Created: Dec 14 2013
 *
 */
/**
 * This module focuses on rendering and updating the substitution UI.
 * Both internal/private and public API methods are defined here.
 */
(function(substitution) {
    var freeLetterDict, encryptedLetterDict, letterFrequencyDict,
        /**
         * Creates a new element representing a free letter. Method stores the
         * free letter element in a dictionary for easy access. First index of
         * the value contains the DOM element and the second if the free letter
         * is in use or not.
         * @param value: Value of the free letter element
         * @return {Element}: Free letter element
         */
        createFreeLetterEl = function(value) {
            var el = document.createElement("div");
            el.setAttribute("class", "freeLetter freeLetterDisplay");
            el.setAttribute("value", value);
            el.textContent = value;

            //Store the letter for easy access
            freeLetterDict[value] = [el, false];
            return el;
        },
        /**
         * Returns a div element for the current word
         * @param word
         * @return {Element}
         */
        createWordEl = function(word) {
            var el = document.createElement("div");
            el.setAttribute("class", "wordContainer");
            for (var i = 0; i < word.length; i++) {
                var currentLetter = word.charAt(i);
                if (!encryptedLetterDict[currentLetter]) {
                    encryptedLetterDict[currentLetter] = [];
                }
                if (substitution.util.isLetter(currentLetter)) {
                    el.appendChild(createLetterEl(currentLetter));
                }
                else {
                    el.appendChild(createUneditableLetterEl(currentLetter));
                }
            }
            return el;
        },
        /**
         * Returns a div element displaying the encrypted letter from the original
         * message and its editable substitute.
         * @param value: Value of the letter
         * @return {Element}: DOM div element
         */
        createLetterEl = function(value) {
            var el = document.createElement("div");
            el.setAttribute("class", "wordLetter");
            el.setAttribute("value", value);

            var inputLetter = createInputEl(value);
            el.appendChild(inputLetter);
            encryptedLetterDict[value].push(inputLetter);
            // setWordLetterEvent(el);
            return el;
        },
        /**
         * Returns an editable input element.
         * @param value: Original value of the encrypted letter
         * @return {Element} DOM input element
         */
        createInputEl = function(value) {
            var el = document.createElement("input");
            el.setAttribute("original", value);
            el.setAttribute("placeholder", value);
            el.setAttribute("class", "letterInput letterInputDisplay");
            el.setAttribute("maxlength", "1");
            return el;
        },
        /**
         * Returns a div element used for displaying non A-Z characters.
         * @param value
         */
        createUneditableLetterEl = function(value) {
            var el = document.createElement("div");
            el.setAttribute("class", "wordLetter");
            el.appendChild(createUneditableInputLetterEl(value));
            return el;
        },
        /**
         * Returns an uneditable input element containing non A-Z characters.
         * @param value
         * @return {Element}
         */
        createUneditableInputLetterEl = function(value) {
            var el = document.createElement("input");
            el.setAttribute("class", "letterInputPunctuation");
            el.setAttribute("value", value);
            el.disabled = true;
            el.textContent = value;
            return el;
        },
        /**
         * Returns an empty div element to represent a space in the
         * encryptedLetterContainer
         * @return {Element}
         */
        createLetterSpaceEl = function(){
            var el = document.createElement("div");
            el.setAttribute("class", "letterSpace");
            return el;
        },
        /**
         * Build the html representation of the solved/in progress message.
         * Used free letters are made bold.
         * @return {string}: String re
         */
        createSolvedMessage = function() {
            var encryptedMessage = substitution.util.getEncryptedMessage();
            var substitutionDict = substitution.util.substitutionDict;
            var solvedMessage = "";
            var solvedMessageRaw = "";
            encryptedMessage.forEach(function(word, idx, array) {
               word.split('').forEach(function (letter) {
                   if (letter in substitutionDict) {
                       solvedMessage += "<span class='messageOutputSolved'>" +
                           substitutionDict[letter] + "</span>";
                       solvedMessageRaw += substitutionDict[letter];
                   } else {
                       solvedMessage += letter;
                       solvedMessageRaw += letter;
                   }
               });
               if (idx !== array.length-1) {
                   solvedMessage += " ";
                   solvedMessageRaw += " ";
               }
            });
            return [solvedMessage, solvedMessageRaw];
        },
        /**
         * Returns a div element used for displaying a letter frequency.
         * @param value: Value of the letter
         * @param frequency: Frequency of the letter
         * @return {Element}: DOM div element
         */
        createFrequencyLetter = function(value, frequency) {
            var el = document.createElement("div");
            el.setAttribute("original", value);
            el.setAttribute("class", "letterFrequency letterFrequencyDisplay");
            el.textContent = value + " = " + frequency;
            letterFrequencyDict[value] = el;
            return el;
        };

    substitution.ui = {
        /**
         * Method loads all the available free letters elements in to the DOM.
         */
        loadFreeLetters: function() {
            var element  = document.getElementById('freeLetterContainer');
            var fragment = document.createDocumentFragment();
            var alphabet = substitution.util.getAlphabet();

            freeLetterDict = {};
            alphabet.forEach(function(value) {
                fragment.appendChild(createFreeLetterEl(value));
            });
            element.appendChild(fragment);
        },
        /**
         * Method loads the encrypted letters in to the DOM.
         */
        loadEncryptedLetters: function() {
            var element  = document.getElementById('encryptedLetterContainer');
            var encryptedWords = substitution.util.getEncryptedMessage();

            encryptedLetterDict = {};
            for (var i = 0; i < encryptedWords.length; i++){
                var currentWord = encryptedWords[i];
                element.appendChild(createWordEl(currentWord));
                if (i < encryptedWords.length - 1){
                    element.appendChild(createLetterSpaceEl());
                }
            }
        },
        /**
         * Method loads the solved/in progress message in to the DOM.
         */
        loadSolvedMessageContainer: function() {
            var element = document.getElementById('solvedMessageContainer');
            var solvedMessageTuple = createSolvedMessage();
            element.innerHTML = solvedMessageTuple[0];
            element.setAttribute('value', solvedMessageTuple[1]);
        },
        /**
         * Method loads the letter frequencies in the encrypted text.
         */
        loadFrequencyDisplay: function() {
            var element = document.getElementById('letterFrequencyContainer');
            var frequencyDict =  substitution.util.letterFrequencyDict;
            letterFrequencyDict = {};
            for (var key in frequencyDict) {
                element.appendChild(createFrequencyLetter(key, frequencyDict[key]));
            }
        },
        /**
         * Method returns the dictionary containing free letters by value.
         * @return {dictionary}: Dictionary containing DOM elements
         */
        getFreeLetters: function() {
            return freeLetterDict;
        },
        /**
         * Method returns the dictionary containing encrypted letters by value.
         * @return {dictionary}: Dictionary containing DOM elements
         */
        getEncryptedLetters: function() {
            return encryptedLetterDict;
        },
        getFrequencyLetters: function() {
            return letterFrequencyDict;
        },
        setEncryptedLettersDisplayValue: function(encryptedLetters, value, addClass, removeClass) {
            var letter;
            var setClass = true;
            if (!(addClass && removeClass)) {
                setClass = false;
            }
            encryptedLetters.forEach(function (el) {
                letter = $(el);
                if (setClass) {
                    $(letter).removeClass(removeClass);
                    $(letter).addClass(addClass);
                }
                letter.attr('value', value);
                letter.val(value);
            })
        },
        setFrequencyLettersDisplayValue: function(el, value, addClass, removeClass) {

            var element = $(el);
            console.log(el);
            console.log(element);

            if ((addClass && removeClass)) {
                element.addClass(addClass);
                element.removeClass(removeClass);
            }
             if (value) {
                 element.html(value + ' =' + element.html().split(' =')[1]);
             }
             else {
                 element.html(element.attr('original') + ' =' + element.html().split(' =')[1]);
             }
        },
        removeFreeLetter: function(value) {
            var freeLetter = $(freeLetterDict[value][0]);
            freeLetter.detach().css({'top': '', 'left': ''});
            freeLetterDict[value][1] = true;
        },
        addFreeLetter: function (value) {
            var freeLetter = $(freeLetterDict[value][0]);
            var freeLetterContainer = $('#freeLetterContainer');
            freeLetterContainer.append(freeLetter);
            freeLetterDict[value][1] = false;
            sortDivs(freeLetterContainer);
        },
    }

}(substitution || {}));


/* Global variables to be used by all components */
var dictionary = null; // maps each letter to its substitution
var frequencyTable = null; // table of letter frequencies in the original message
var frequencyDictionary = null;
var ALPHABET = null; // array containing the 25 letters in the english alphabet for resetting
var textDictionary = null;
var freeLetterDictionary = null;
var chartData = null;
var eventLetter = null;
var ind = null;

/**
 * Sort element children doms by value attribute
 * @param element
 */
function sortDivs(element) {
    var alphabeticallyOrderedDivs = element.children().sort(function (a, b) {
        var textA = $(a).attr('value').toUpperCase();
        var textB = $(b).attr('value').toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
    element.append(alphabeticallyOrderedDivs);
}

/**
 * Method checks if hash of the solved encrypted message matches the original
 * text hash. If they match, the timer is stopped and a popup is display to
 * enter the participants name.
 */
function checkHash() {
    if (md5($("#solvedMessageContainer").attr('value').toUpperCase()) == substitution.util.original_hash) {
        clearInterval(timer.timerId);
        displayFinishPopup();
    }
}

/**
 * Method displays the popup when the puzzle if solved. The participant can
 * enter his/hers name to be added to the leaderboard.
 */
function displayFinishPopup() {
    var txt;
    var total_minutes = (timer.count_hour * 60 + timer.count_minute);
    $('#modal-time-minute').html(total_minutes);
    $('#modal-time-second').html(timer.count_second);
    var modal = $("#myModal");
    modal.off("click");
    modal.modal('show');
    modal.on('click', '#confirm', function (e) {
        var player = $('#username').val();
        if (player == null || player == "" || player.length != 3) {
            $('#modal-alert').show();
        } else {
            $(function() {
                $.ajax({
                    url: '/substitution/leaderboard/insert',
                    data: {
                        'name': player,
                        'difficulty': substitution.util.difficulty,
                        'time_solved': (timer.count_hour * 3600 + timer.count_minute * 60 + timer.count_second)
                    },
                    type: 'POST',
                    success: function (response) {},
                    error: function (error) {}
                });
            });
            modal.modal('hide');
        }
    });
}