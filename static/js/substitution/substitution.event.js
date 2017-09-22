/**
 * This module is concerned with handling DOM events. All user interactions are accounted
 * for here. For example, when the edit button is clicked, that interaction is handled in
 * this file.
 */
(function(substitution) {
    var registerEncryptedLetterDraggableEvent = function(encryptedLetters) {
            $(encryptedLetters).draggable({
                start:
                    function(event, ui) {
                        $(this).data('uihelper', ui.helper);
                    },
                helper: "clone",
                // cursorAt: { left: 5, top: 5 },
                showAnim: '',
                revertDuration: 0,
                revert: function(value) {
                    var uiHelper = $(this).data('uihelper');
                    uiHelper.data('dropped', value !== false);
                    if (value === false) {
                        wordLetterDroppedOutside($(this));
                        return true;
                    }
                    return false;
                },
                cancel: ''
            });
        },
        unregisterEncryptedLetterDraggableEvent = function(encryptedLetters) {
            $(encryptedLetters).draggable('destroy');
        },
        wordLetterDroppedOn = function(event, ui) {
            var from = $(ui.draggable);
            var to = $(this);
            var fromValue = from.attr('value');
            var toValue = to.attr('value');
            var toOriginal = to.attr('original');
            if (from.is('div')) {
                freeLetterDroppedOnWordLetter(fromValue,toValue, toOriginal);
            } else {
                var fromOriginal = from.attr('original');
                wordLetterDroppedOnWordLetter(fromValue,toValue, toOriginal, fromOriginal);
            }
            substitution.ui.loadSolvedMessageContainer();
            startTimer();
            checkHash();
        },
        freeLetterDroppedOnWordLetter = function(fromValue, toValue, toOriginal) {
            var encryptedLetters = substitution.ui.getEncryptedLetters()[toOriginal];
            if (toValue) {
                substitution.ui.setEncryptedLettersDisplayValue(encryptedLetters, fromValue,
                    'freeLetterDisplay', 'letterInputDisplay');
                substitution.ui.addFreeLetter(toValue);
                substitution.ui.removeFreeLetter(fromValue);
                substitution.util.setSubstitution(toOriginal, fromValue);
                substitution.ui.setFrequencyLettersDisplayValue(substitution.ui.getFrequencyLetters()[toOriginal], fromValue,
                    'letterFrequencyDisplaySolved', 'letterFrequencyDisplay');
            }
            else {
                registerEncryptedLetterDraggableEvent(encryptedLetters);
                substitution.ui.setEncryptedLettersDisplayValue(encryptedLetters, fromValue,
                    'freeLetterDisplay', 'letterInputDisplay');
                substitution.ui.removeFreeLetter(fromValue);
                substitution.util.setSubstitution(toOriginal, fromValue);
                console.log(toOriginal);
                console.log(substitution.ui.getFrequencyLetters()[toOriginal]);
                substitution.ui.setFrequencyLettersDisplayValue(substitution.ui.getFrequencyLetters()[toOriginal], fromValue,
                    'letterFrequencyDisplaySolved', 'letterFrequencyDisplay');
            }
        },
        wordLetterDroppedOnWordLetter = function(fromValue, toValue, toOriginal, fromOriginal) {
            var lettersTo = substitution.ui.getEncryptedLetters()[toOriginal];
            var lettersFrom = substitution.ui.getEncryptedLetters()[fromOriginal];
            if (toValue) {
                substitution.ui.setEncryptedLettersDisplayValue(lettersTo, fromValue,
                    null, null);
                substitution.ui.setEncryptedLettersDisplayValue(lettersFrom, toValue,
                    null, null);
                substitution.util.setSubstitution(toOriginal, fromValue);
                substitution.util.setSubstitution(fromOriginal, toValue);


            }
            else {
                registerEncryptedLetterDraggableEvent(lettersTo);
                unregisterEncryptedLetterDraggableEvent(lettersFrom);
                substitution.ui.setEncryptedLettersDisplayValue(lettersTo, fromValue,
                    'freeLetterDisplay', 'letterInputDisplay');
                substitution.ui.setEncryptedLettersDisplayValue(lettersFrom, "",
                    'letterInputDisplay', 'freeLetterDisplay');

                substitution.util.setSubstitution(toOriginal, fromValue);
                substitution.util.removeSubstitution(fromOriginal);
            }
        },
        wordLetterDroppedOutside = function (from) {
            var fromValue = from.attr('value');
            var fromOriginal = from.attr('original');
            removeWordLetter(fromValue, fromOriginal);
            substitution.ui.setFrequencyLettersDisplayValue(substitution.ui.getFrequencyLetters()[fromOriginal], "",
                    'letterFrequencyDisplay', 'letterFrequencyDisplaySolved');
            substitution.ui.loadSolvedMessageContainer();
        },
        removeWordLetter = function(fromValue, fromOriginal) {
            var lettersFrom = substitution.ui.getEncryptedLetters()[fromOriginal];
            substitution.ui.setEncryptedLettersDisplayValue(lettersFrom, "",
                    'letterInputDisplay', 'freeLetterDisplay');
            substitution.util.removeSubstitution(fromOriginal);
            substitution.ui.addFreeLetter(fromValue);
            unregisterEncryptedLetterDraggableEvent(lettersFrom);
        },
        inputLetterChangeEvent = function(event) {
            var input = $(event.originalEvent.target);
            var inputValue = input.val().toUpperCase();
            var toOriginal = input.attr('original');
            var fromValue = input.attr('value');
            var invalid = false;
            if (inputValue) {
                if (inputValue in substitution.ui.getFreeLetters() &&
                    !substitution.ui.getFreeLetters()[inputValue][1]) {
                    if (fromValue) {
                        freeLetterDroppedOnWordLetter(inputValue, fromValue, toOriginal);
                    } else {
                        freeLetterDroppedOnWordLetter(inputValue, "", toOriginal);
                    }
                } else {
                    input.val("");
                    input.blur();
                    return
                }
            } else {
                removeWordLetter(fromValue, toOriginal);
            }
            substitution.ui.loadSolvedMessageContainer();
            input.blur();
            startTimer();
            checkHash();
        },
        wordLetterHoverOnEvent = function(value, classsList, classCondition) {
            var array = $(substitution.ui.getEncryptedLetters()[value]);
            if (classsList.includes(classCondition)) {
                array.addClass("letterInputDisplayHover");
            }
            else {
                array.addClass("freeLetterDisplayHover");
            }
        },
        wordLetterHoverOffEvent = function(value) {
            var array = $(substitution.ui.getEncryptedLetters()[value]);
            array.removeClass('freeLetterDisplayHover');
            array.removeClass('letterInputDisplayHover');
        };

    substitution.event = {
        registerFreeLetterDraggableEvent: function () {
            var freeLettersDict = substitution.ui.getFreeLetters();
            for (var key in freeLettersDict) {
                if (freeLettersDict.hasOwnProperty(key)) {
                    $(freeLettersDict[key][0]).draggable({
                        // cursorAt: { left: 5, top: 5 },
                        // helper: "clone",
                        showAnim: '',
                        revertDuration: 0,
                        revert: true
                    });
                }
            }
        },
        registerWordLetterClickEvent: function () {
            var encryptedLetterContainer = $('#encryptedLetterContainer');
            encryptedLetterContainer.children().on("click", function (event) {
                $(this).children('input').focus();
            });
        },
        registerWordLetterDroppableEvent: function () {
            var encryptedLetterDict = substitution.ui.getEncryptedLetters();
            for (var key in encryptedLetterDict) {
                if (encryptedLetterDict.hasOwnProperty(key)) {
                    $(encryptedLetterDict[key]).droppable({
                        accept: 'div, input',
                        drop: wordLetterDroppedOn
                    });
                }
            }
        },
        registerWordInputChangeEvent: function () {
            $('#encryptedLetterContainer').find('input').on(
                'input propertychange', inputLetterChangeEvent)
        },
        registerNavBarButtonEvent: function () {
            var nextBtn = $('#btn-next');

            nextBtn.on('click', function() {
                window.location.reload(true);
            });

            var resetBtn = $('#btn-reset');
            resetBtn.on('click', function() {
                $('#freeLetterContainer').empty();
                $('#encryptedLetterContainer').empty();
                substitution.ui.loadFreeLetters();
                substitution.ui.loadEncryptedLetters();
                substitution.util.substitutionDict = {};
                substitution.ui.loadSolvedMessageContainer();
                substitution.event.registerFreeLetterDraggableEvent();
                substitution.event.registerWordLetterClickEvent();
                substitution.event.registerWordLetterDroppableEvent();
                substitution.event.registerWordInputChangeEvent();
            });

        },
        registerFreeLetterHoverEvent : function () {
            $('.freeLetter').hover(
            function() {
                $( this ).addClass( "freeLetterDisplayHover" );
                },
            function() {
                $( this ).removeClass( "freeLetterDisplayHover" );
            });
        },
        registerLetterInputHoverEvent : function () {
            $('.letterInput').hover(
            function() {
                wordLetterHoverOnEvent($(this).attr('original'), $(this).attr('class').split(/\s+/),
                    'letterInputDisplay');
            }, function() {
                wordLetterHoverOffEvent($(this).attr('original'));
            });
        },
        registerFrequencyHoverEvent: function () {
            $('.letterFrequency').hover(
                function () {
                    wordLetterHoverOnEvent($(this).attr('original'), $(this).attr('class').split(/\s+/),
                        'letterInputDisplay');
                }, function () {
                    wordLetterHoverOffEvent($(this).attr('original'));
            });
        }

    }
}(substitution || {}));
