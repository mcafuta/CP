// Register the "substitution" namespace (public variable) if it doesn't already exist.
var substitution = substitution || {};

/**
 * This is a utility module that provides generalized convenience methods
 * for the rest of the codebase.
 */
(function(substitution) {
    var letterFrequencyDict,
        /**
        * Method determines if a letter is between A and Z.
        * Parameter letter is changed to uppercase before check.
        * @param letter: Letter to be verified
        * @return {boolean}: True if it is a valid character otherwise False
        */
        isLetter = function(letter){
            letter = letter.toUpperCase();
            return (letter.charCodeAt(0) < 91 && letter.charCodeAt(0) >= 65 || ['Č', 'Š', 'Ž'].includes(letter));
        },
        /**
         * Method updates the letter array containing letter frequencies
         * @param value: Value used to update the array
         */
        updateFrequencyArray = function(value) {
            if (isLetter(value)) {
                if (letterFrequencyDict[value] !== undefined) {
                    letterFrequencyDict[value]++;
                }
                else {
                    letterFrequencyDict[value] = 1;
                }
            }
        },
        /**
         * Sort object by values
         * @param obj
         * @return {*}
         */
        sortByValue = function(obj) {
            var tuples = [];
            var out = [];
            for (var key in obj) tuples.push([key, obj[key]]);
            tuples.sort(function(a, b) {return a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0 });
            var length = tuples.length;
            while (length--) out[tuples[length][0]] = tuples[length][1];
            return out;
        };

    substitution.util = {
        /**
         * Collection of variables passed from the server
         */
        input: null, lang: null, original_hash: null, difficulty: null, foreign:null,
        nextUrl: null, insertUrl: null, staticDir: null, baseURL: null, level: null,
        encryptedMessage: [], substitutionDict: {}, letterFrequencyDict: {},
        /**
         * Method isLetter public wrapper.
         */
        isLetter: function(value) {
            return isLetter(value);
        },
        /**
         * Method returns all the available letters that can be used in solving
         * the encrypted text
         * @return {Array}
         */
        getAlphabet: function() {
            var alphabet = [];
            var A = "A".charCodeAt(0);
            for (var i = 0; i < 26; i++) {
                var newChar = String.fromCharCode(A + i);
                if (this.lang === "sl" && !this.foreign && ['Q', 'W', 'X', 'Y'].includes(newChar))
                    continue;
                alphabet.push(newChar);
                if (this.lang === "sl" || this.foreign) {
                    if (newChar === 'C') alphabet.push('Č');
                    if (newChar === 'S') alphabet.push('Š');
                    if (newChar === 'Z') alphabet.push('Ž');
                }
            }
            return alphabet;
        },
        /**
         * Method build an array of words containing the encrypted letters.
         * During processing it updates the letter frequency array.
         */
        getEncryptedMessage: function () {
            if (this.encryptedMessage.length > 0) {
                return this.encryptedMessage;
            }
            else {
                var i;
                var currentWord = "";
                var encryptedMessage = [];
                letterFrequencyDict = {};
                for (i = 0; i < this.input.length; i++) {
                    var currentCharacter = this.input.charAt(i).toUpperCase();
                    if(this.level === 2){
                        currentCharacter = currentCharacter.trim().split(',').join("");
                    }
                    updateFrequencyArray(currentCharacter);
                    if (!(currentCharacter === ' ' || currentCharacter === '\n')){
                        currentWord += currentCharacter;
                    }
                    else{
                        if (currentWord !== ""){
                            encryptedMessage.push(currentWord);
                        }
                        currentWord = "";
                    }
                    if (i === (this.input.length - 1)){
                        if (currentWord !== ""){
                            encryptedMessage.push(currentWord);
                        }
                        currentWord = "";
                    }
                }
                this.letterFrequencyDict = sortByValue(letterFrequencyDict);
                this.encryptedMessage = encryptedMessage;
                return encryptedMessage;
            }
        },
        setSubstitution: function(original, value) {
            this.substitutionDict[original] = value;
        },
        removeSubstitution: function (original) {
            delete this.substitutionDict[original];
        }
    }
}(substitution || {}));