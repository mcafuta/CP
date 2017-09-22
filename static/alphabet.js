// VARIABLES
var alphabet;
var cookie_name = "kriptogram_alphabet_points";
var expDays = 365;
var ansHist = [];
var histPtr = 0;
var curHandPos = [0,0]; // [right,left]
//var pointsForRightAnswerReadEasy = 3;<-- not in use
var pointsForClueReadMedium = 30;
var pointsForClueReadHard = 50;
var userAnswers = [];
var readHardTimer;
var prevLetter = "-";
var positions = {   // x = [right, left]
        'a':[225,180],'b':[270,180],'c':[315,180],'d':[0,180],'e':[180,45],'f':[180,90],
        'g':[180,135],'h':[270,225],'i':[225,315],'j':[0,90],'k':[225,0],'l':[225,45],
        'm':[225,90],'n':[225,135],'o':[270,315],'p':[270,0],'q':[270,45],'r':[270,90],
        's':[270,135],'t':[315,0],'u':[315,45],'v':[0,135],'w':[45,90],'x':[45,135],
        'y':[315,90],'z':[135,90],' ':[180,180],'init':[0,0], '1':[225,180],'2':[270,180],
        '3':[315,180],'4':[0,180],'5':[180,45],'6':[180,90],'7':[180,135],'7':[270,225],
        '9':[225,315],
    };
var middlePointRight, middlePointLeft;


// INITIALIZATION
function initialize_alphabet(mode, level) {
    refresh();
    // Get ready to watch user inputs
    for (var i = 0; i < alphabet.length; i++) {
        userAnswers[alphabet[i]] = 0;
    }

    if (mode == "read") {
        if (level == "easy") {
            read_easy();
        } else if (level == "medium") {
            read_medium();
        } else if (level == "hard") {
            read_hard();
        }
    } else if (mode == "write") {
        if (level == "easy") {
            write_easy();
        } else if (level == "medium") {
            write_medium();
        } else if (level == "hard") {
            write_hard();
        }
    }
}

function read_easy() {
}

function read_medium() {
    $("#read_medium_solution").removeAttr("disabled");
    setTimeout(function() {
        $("#letterInput").focus();
    }, 500);
}

function read_hard() {
    // Clean up
    $(".level-read-hard .panel-body .well").html("");
    $("#input-string-hard").html("");
    $("#next-arrow").removeAttr("href");
    $("#start-animation").removeAttr("disabled");
    $("#start-animation").removeClass("used");
    $("#start-animation").text("Začni!");
    
    var word = selectNewWord(window.words);
    var letters = word.split("");
    var idNumber = 1;
    $(".level-read-hard .panel-body .well").append("<img src='" + "/static/" +  "blank.png' class=''>");
    for (i = 0; i < letters.length; i++) {
        var letter = letters[i];
        $(".level-read-hard .panel-body .well").append("<img src='" + flagsDir + letter + ".png' class='hidden'>");
        $("#input-string-hard").append('<input id="num' + idNumber + '" class = "letterInputClass" type="text" maxlength="1" onkeyup="focusNext(event, \'#num' + (idNumber+1) + '.letterInputClass\')">');
        idNumber++;
    }
}

function write_easy() {
}

function write_medium() {
    setFigure();
    setFlagsMedium();
}

function write_hard() {
    setFigure();
}


$( document ).ready(function() {
    checkCookie(cookie_name);
    
    // flip animation (index site)
    $('.f1_container').click(function() {
            $(this).toggleClass('active');
        }); 
        
    // pop-up instructions
    $("#pop-up").click(function(){
        $("#myModal").css("display", "block");
    });
    
    $("#cl").click(function() {
        $("#myModal").css("display", "none");
    })
    
    
    ///////////////////
    /* When the user clicks on the button, 
    toggle between hiding and showing the dropdown content */
   
    $("#writeButton").click(function(){
        $("#myDropdown").toggleClass( "show");
    });
    
    // Close the dropdown menu if the user clicks outside of it
    /*
    window.onclick = function(event) {
      if (!event.target.matches('.dropbtn')) {
    
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
          var openDropdown = dropdowns[i];
          if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
          }
        }
      }
    }
    */
    ///////////////////
    
    /* *************************************************************************** */
    /* ********************************   READ  ********************************** */
    /* *************************************************************************** */
     
    /*
     *      READ EASY
     */
    
    // Function listens for click on multiple choices
    $("#choices .btn").click(function() {
       var letter = getLetterFromURL($("#picture-letter img").attr("src"));
       if ((this.innerHTML).toUpperCase() === letter.toUpperCase()) {
             $(this).removeClass("btn-info");
            $(this).addClass("btn-success");
            $("#next-arrow").attr("href", "next");
            buttonsDisable();
            // History
            if(histPtr == 0 && ansHist.length < 1 ){
                addHistoryEasy(0,1);
            }
            else{
                addHistoryEasy(1,1);
            }
            //Points and learning progress
            //addPoints(pointsForRightAnswerReadEasy); <-- not in use
            addPoints(1);
            moveToLearnt(letter);
       } else {
            $(this).removeClass("btn-info");
            $(this).addClass("btn-danger");
            $(this).attr("disabled", "disabled");
            // History
            addHistoryEasy(1,0);
             //Points and learning progress
            removePoints(1);
            moveToNotLearnt(letter);
            //pointsForRightAnswerReadEasy--; <-- not in use
       }
    });
    
    // Function listens for click on help button    <-- not in use
    $(".level-read-easy #read_easy_help").click(function(e){
        if(pointsForRightAnswerReadEasy > 0){
        //disables one option
        disableOneChoiceRead();
        }
    });
    
    // Function listens for click on "next arrow"
    $(".level-read-easy #next-arrow").click(function(e) {
        e.preventDefault();
        if ($("#next-arrow").attr("href") === "next") {
            histPtr++;
            if(histPtr == ansHist.length){  // New letter
                selectAndDisplayNewLetter(window.alphabet,"easy");
                //pointsForRightAnswerReadEasy = 3; <-- not in use
                if(histPtr != 0){
                    addHistoryEasy(0,0); // push to history and mark as unanswered
                }
            }
            else if(histPtr == ansHist.length-1 && ansHist[histPtr][1] == 0){   // Chosen letter is not answered
                displayOldLetter(ansHist[histPtr][2], getChoices(ansHist[histPtr][0]));
                //pointsForRightAnswerReadEasy = ansHist[histPtr][3]; <-- not in use
            }
            else if(histPtr == ansHist.length-1 && ansHist[histPtr][1] == 1){   // Chosen letter is answered
                $(".level-read-easy #next-arrow").attr("href", "next");
                restoreHistoryEasy();
            }
            else{   // Chosen letter is answered
                restoreHistoryEasy();
            }
            $(".level-read-easy #prew-arrow").attr("href", "prew");
            if(histPtr == ansHist.length-1 && ansHist[histPtr][1] == 0)$(".level-read-easy #next-arrow").removeAttr("href"); 
        }
        
    });
    
    // Function listens for click on "prew arrow"
    $(".level-read-easy #prew-arrow").click(function(e) {
        e.preventDefault();
        if ($("#prew-arrow").attr("href") === "prew") {
            histPtr--;
            restoreHistoryEasy();
        }
    });
    
    
    /*
     *      READ MEDIUM
     */
    
    // Function listens for enter press and checks the answer
    $("#letterInput").keypress(function(e) {
        //Enter pressed?
        if(e.which == 10 || e.which == 13) {
            var vnos = (document.getElementById('letterInput')).value;
            if ($("#picture-letter").hasClass("tested") || vnos === "") {
                // Enter was pressed without changing the letter
                // Or: input is empty
                return;
            } else {
                // Marks enter as "pressed" - pressing agen don't cause more negative points
                $("#picture-letter").addClass("tested");
            }
            
            // Checks if input letter matches with correct one
            var image_link = $("#picture-letter img").attr("src").split("/");
            var image_name = image_link[image_link.length - 1];
            var letter = image_name.split(".")[0];
            

            if(vnos.toUpperCase() === letter.toUpperCase()){
                $("#letterInput").addClass("correctInput");
                $("#letterInput").removeClass("wrongInput");
                $("#next-arrow").attr("href", "next");
                document.getElementById('letterInput').disabled = true;
                // History
                if(histPtr == 0 && ansHist.length < 1 ){
                    addHistoryMedium(0,1);
                }
                else{
                    addHistoryMedium(1,1);
                }
                
                $("#picture-letter").removeClass("tested");
                $("#next-arrow").focus();
                // Points and learning progress
                addPoints(1);
                moveToLearnt(letter);
            } else {
                $("#letterInput").addClass("wrongInput");
                $("#letterInput").removeClass("correctInput");
                $("#letterInput").focus().select();
                moveToNotLearnt(letter);
                if(histPtr == 0 && ansHist.length < 1 ){
                    addHistoryMedium(0,0);
                }
                else{
                    addHistoryMedium(1,0);
                }
                // Points and learning progress
                removePoints(1);
                moveToNotLearnt(letter);
            }
                
        } else {
            $("#picture-letter").removeClass("tested");
        }
    });
    
    // Function shows the correct solution
    $("#read_medium_solution").click(function(){
        $(this).attr("disabled", "disabled");
        if (getPoints() >= pointsForClueReadMedium) {
            var url = $("#picture-letter img").attr("src");
            var letterSelected = getLetterFromURL(url);
            $("#letterInput").val(letterSelected);
            $("#next-arrow").attr("href", "next");
            $("#letterInput").addClass("correctInput");
            $("#letterInput").removeClass("wrongInput");
            // History
            if(histPtr == 0 && ansHist > 1 ){
                addHistoryMedium(0,1);
            }
            else{
                addHistoryMedium(1,1);
            }
            // Points and learning progress
            removePoints(pointsForClueReadMedium);
            moveToNotLearnt(letterSelected);
            $("#next-arrow").focus();
        } else {
            $("#letterInput").focus();
        }
    });
    
    // Listens for click on "next arrow" (read-medium)
    $(".level-read-medium #next-arrow").click(function(e) {
        e.preventDefault();
        if ($("#next-arrow").attr("href") === "next") {
            histPtr++;
            if(histPtr == ansHist.length){  // New letter
                selectAndDisplayNewLetter(window.alphabet,"medium");
                refresh();
                $("#letterInput").removeClass()
                $("#letterInput").val("");
                $("#letterInput").focus();
                if(histPtr != 0){
                    addHistoryMedium(0,0); // push to history and mark as unanswered
                }
            }
            else if(histPtr == ansHist.length-1 && ansHist[histPtr][1] == 0){   // Chosen letter is not answered
                displayOldLetterMedium(ansHist[histPtr]);
                $("#read_medium_solution").removeAttr("disabled");
            }
            else if(histPtr == ansHist.length-1 && ansHist[histPtr][1] == 1){   // Chosen letter is answered
                $(".level-read-medium #next-arrow").attr("href", "next");
                restoreHistoryMedium();
            }
            else{   // Chosen letter is answered
                restoreHistoryMedium();
            }
            $(".level-read-medium #prew-arrow").attr("href", "prew");
            if(histPtr == ansHist.length-1 && ansHist[histPtr][1] == 0)$(".level-read-medium #next-arrow").removeAttr("href"); 
        }
     
    });
    
    // Listens for click on "prev arrow" (read-medium)
    $(".level-read-medium #prew-arrow").click(function(e) {
        e.preventDefault();
        if ($("#prew-arrow").attr("href") === "prew") {
            histPtr--;
            restoreHistoryMedium();
        }
    });
    
    
    /*
     *      READ HARD
     */
    
    // Function checks input when enter is pressed
    $("#input-string-hard").keypress(function(e) {
        // Enter pressed?
        if(e.which == 10 || e.which == 13) {
            console.log("enter pressed");
            var index = 1;
            var numWrongOrUnanswered = 0;
            var numWrong = 0; var numCorrect = 0;
            $("#input-string-hard .letterInputClass").each(function(index) {
                var input = $(this).val();
                var letter = getLetterFromURL($("#picture-letter img:eq(" + (index+1) + ")").attr("src"));
                console.log("letter<-------: "+letter);
                console.log("input<-------: "+input);
                if (input.toUpperCase() === letter.toUpperCase()) {
                    // Correct input
                    if ($(this).attr("disabled") != "disabled") {
                        $(this).addClass("correctInput");
                        $(this).removeClass("wrongInput");
                        $(this).removeClass("tested");
                        $(this).attr("disabled", "disabled");
                        numCorrect++;
                    }
                } else {
                    if (input !== "") {
                        // Wrong input
                        if (! $(this).hasClass("tested")) {
                            $(this).addClass("wrongInput");
                            $(this).addClass("tested");
                            numWrong++;
                        }
                    } else {
                        // Empty input
                        $(this).removeClass("wrongInput");
                        $(this).removeClass("tested");
                    }
                    $(this).removeClass("correctInput");
                    numWrongOrUnanswered++;
                }
                index++;
            });
            if (numWrongOrUnanswered == 0) {
                $("#next-arrow").attr("href", "next");
                $("#next-arrow").focus();
                if(histPtr == 0 && ansHist.length < 1 ){
                    pushHistoryReadHard(1);
                }
                else{
                    setHistoryReadHard(1);
                }
            } else {
                // Sets cursor to first wrong letter
                var el = $("#num1");
                while (el.attr("disabled") == "disabled") {
                    el = el.next();
                }
                el.focus().select();
                if(histPtr == 0 && ansHist.length < 1 ){
                    pushHistoryReadHard(0);
                }
                else{
                    setHistoryReadHard(0);
                }
            }
            addPoints(numCorrect);
            removePoints(numWrong);
        } else {
            $("#input-string-hard .letterInputClass").each(function(index) {
                $(this).removeClass("tested");
            });
        }
    });
    
    // Function starts animaton
    $("#start-animation").click(function() {
        if ($(this).hasClass("used")) {
            removePoints(pointsForClueReadHard);
        }
        $(this).attr("disabled", "disabled");
        focusFirstFree("#input-string-hard #num1");
        //$(".level-read-hard .well img" + ":eq(" + (1 - 1) + ")").addClass("hidden");
        displaySequenceOfImages(".level-read-hard .well img", 0);
        $(this).addClass("used");
        $("#start-animation").text("Začni znova!");
    });
    
    // Listens for click on "next arrow" (read-hard)
    $(".level-read-hard #next-arrow").click(function(e) {
        e.preventDefault();
        if ($("#next-arrow").attr("href") === "next") {
            histPtr++;
            console.log("next-arrow");
            if(histPtr == ansHist.length){  // New seq
                console.log("1");
                read_hard();
                refresh();
                $("#start-animation").css("visibility", "visible");
                console.log("Odstranil bom next arrow (1)");
                $(".level-read-hard #next-arrow").removeAttr("href");
                if(histPtr != 0){
                    pushHistoryReadHard(0); // push to history and mark as unanswered
                }
            }
            
            else if(histPtr == ansHist.length-1 && ansHist[histPtr][1] == 0){   // Chosen letter is not answered
                console.log("2");
                $("#start-animation").css("visibility", "visible");
                restoreStringReadHard(ansHist[histPtr][0]);
            }
            
            else if(histPtr == ansHist.length-1 && ansHist[histPtr][1] == 1){   // Chosen letter is answered
            console.log("3");
                $(".level-read-hard #next-arrow").attr("href", "next");
                restoreHistoryReadHard();
            }
            
            else{   // Chosen letter is answered
            console.log("4");
                restoreHistoryReadHard();
            }
            
            $(".level-read-hard #prew-arrow").attr("href", "prew");
            if(histPtr == ansHist.length-1 && ansHist[histPtr][1] == 0) $(".level-read-hard #next-arrow").removeAttr("href");
        }
    });
    
    // Listens for click on "prev arrow" (read-hard)
    $(".level-read-hard #prew-arrow").click(function(e) {
        e.preventDefault();
        if ($("#prew-arrow").attr("href") === "prew") {
            histPtr--;
            restoreHistoryReadHard();
            textFieldsDisable(".letterInputClass");
            $("#start-animation").css("visibility", "hidden");
            $(".level-read-hard #next-arrow").attr("href", "next");
            if(histPtr == 0){
                $("#prew-arrow").removeAttr("href");
            }
        }
    });
    
    
    /* *************************************************************************** */
    /* *******************************   WRITE  ********************************** */
    /* *************************************************************************** */
    
    /*
     *      WRITE EASY
     */
    
    // Function checks correctness of choice
    $(".imageSelectionWrap #picture-letter").click(function() {
        if ($(this).hasClass("not_active")) return;
        var url = $(this).find(".imageSelection").attr("src");
        var letterSelected = getLetterFromURL(url);
        var letter = $(".level-write-easy #letterToGuess span").text();
        console.log(letter);
        if (letterSelected.toUpperCase() === letter.toUpperCase()) {
            $(this).parent().addClass("correctInput");
            $(this).parent().removeClass("wrongInput");
            $("#next-arrow").attr("href", "next");
            imageButtonsDisable($(this).parent().parent());
            // History
            if(histPtr == 0 && ansHist > 1 ){
                addHistoryWriteEasy(0,1);
            }
            else{
                addHistoryWriteEasy(1,1);
            }
            // Points and learning progress
            addPoints(1); 
            moveToLearnt(letter);
        } else {
            $(this).parent().removeClass("correctInput");
            $(this).parent().addClass(("wrongInput"));
            imageOneButtonDisable(this);
            // History
            if(histPtr == 0 && ansHist > 1 ){
                addHistoryWriteEasy(0,0);
            }
            else{
                addHistoryWriteEasy(1,0);
            }
            // Points and learning progress
            removePoints(1);
            moveToNotLearnt(letter);
        }
    });
    
    // Listens for click on "next arrow" (write-easy)
    $(".level-write-easy #next-arrow").click(function(e) {
        e.preventDefault();
        if ($("#next-arrow").attr("href") === "next") {
            histPtr++;
            if(histPtr == ansHist.length){  // New letter
                selectAndDisplayNewImage(alphabet, "easy");
                refresh();
                imageButtonsEnable($(".imageSelectionWrap #picture-letter").parent().parent());
                if(histPtr != 0){
                    addHistoryWriteEasy(0,0); // push to history and mark as unanswered
                }
            }
            else if(histPtr == ansHist.length-1 && ansHist[histPtr][1] == 0){   // Chosen letter is not answered
                displayOldLetterWriteEasy(ansHist[histPtr][2], ansHist[histPtr][0]);
            }
            else if(histPtr == ansHist.length-1 && ansHist[histPtr][1] == 1){   // Chosen letter is answered
                $(".level-write-easy #next-arrow").attr("href", "next");
                restoreHistoryWriteEasy();
            }
            else{   // Chosen letter is answered
                restoreHistoryWriteEasy();
            }
            $(".level-write-easy #prew-arrow").attr("href", "prew");
            if(histPtr == ansHist.length-1 && ansHist[histPtr][1] == 0)$(".level-write-easy #next-arrow").removeAttr("href"); 
        }
    
        
    });
    
    // Listens for click on "prew arrow" (write-easy)
    $(".level-write-easy #prew-arrow").click(function(e) {
        e.preventDefault();
        if ($("#prew-arrow").attr("href") === "prew") {
            histPtr--;
            restoreHistoryWriteEasy();
        }
    });
    
   
    /*
     *        WRITE MEDIUM
     */
    
    // Listens for click on "check" (write-medium)
    $(".level-write-medium #check").click(function(e) {
        e.preventDefault();
        if($("#check").attr("href") === "enabled"){
            var letter = $(".level-write-medium #letterToGuess span").text().toLowerCase();
            if(checkIfCorrWrite()){
                markCheckControlWrite(1);
                disableCheckControlWrite();
                $(".level-write-medium #next-arrow").attr("href", "next");
                // History
                if(histPtr == 0){
                    pushHistoryWriteMedium(1);
                }
                else{
                    setHistoryWriteMedium(1);
                }
                // Points and learning process
                moveToLearnt(letter);
                addPoints(1);
            }
            else if(checkIfOtherCorrLetterWrite()){}
            else{
                markCheckControlWrite(0);
                // Points and learning process
                removePoints(1);                
                moveToNotLearnt(letter);
            }
        }
    });
    
    // Listens for click on "prew arrow" (write-hard)
    $(".level-write-medium #prew-arrow").click(function(e) {
        e.preventDefault();
        if ($("#prew-arrow").attr("href") === "prew") {
            disableFlags("both");
            histPtr--;
            getAndDisplayHistoryWrite();
            $(".level-write-medium #next-arrow").attr("href", "next");
            if(histPtr == 0){
                $("#prew-arrow").removeAttr("href");
            }
        }
    });
    
    // Listens for click on "next arrow" (write-medium)
    $(".level-write-medium #next-arrow").click(function(e) {
        e.preventDefault();
        if ($("#next-arrow").attr("href") === "next") {
            histPtr++;
            if(histPtr == ansHist.length){  // New letter
                enableFlags("both");
                selectAndDisplayNewLetterWriteMedium(window.alphabet,"easy");
                $(".level-write-medium #next-arrow").removeAttr("href");
                if(histPtr != 0){
                    pushHistoryWriteMedium(0); // push to history and mark as unanswered
                }
            }
            else if(histPtr == ansHist.length-1 && ansHist[histPtr][1] == 0){   // Chosen letter is not answered
                enableFlags("both");
                DisplayNewLetterWriteMedium(ansHist[histPtr][0]);
            }
            else if(histPtr == ansHist.length-1 && ansHist[histPtr][1] == 1){   // Chosen letter is answered
                $(".level-write-medium #next-arrow").attr("href", "next");
                getAndDisplayHistoryWrite();
            }
            else{   // Chosen letter is answered
                getAndDisplayHistoryWrite();
            }
            $(".level-write-medium #prew-arrow").attr("href", "prew");
            if(histPtr == ansHist.length-1 && ansHist[histPtr][1] == 0)$(".level-write-medium #next-arrow").removeAttr("href");
        }
    });
    
    
    /*
     *        WRITE HARD
     */
    
    // Listens for click on "check" (write-hard)
    $(".level-write-hard #check").click(function(e) {
        e.preventDefault();
        if($("#check").attr("href") === "enabled"){
            var letter = $(".level-write-hard #letterToGuess span").text().toLowerCase();
            if(checkIfCorrWrite()){ markCheckControlWrite(1);
                disableCheckControlWrite();
                $(".level-write-hard #next-arrow").attr("href", "next");
                // History
                if(histPtr == 0){
                    pushHistoryWriteHard(1);
                }
                else{
                    setHistoryWriteHard(1);
                }
                // Points and learning progress
                if($("#imageLeftFlag").attr("href")!="enabled" || $("#imageRightFlag").attr("href")!="enabled"){
                    addPoints(1); 
                }
                else addPoints(2);
                moveToLearnt(letter);
            }
            else if(checkIfOneIsCorrWrite()){
                checkIfOtherCorrLetterWrite();
                
            }
            else if(checkIfOtherCorrLetterWrite()){}
            else{
                markCheckControlWrite(0);
                // Points and learning progress
                if($("#imageLeftFlag").attr("href")!="enabled" || $("#imageRightFlag").attr("href")!="enabled"){
                    removePoints(1); 
                }
                else removePoints(2); 
                moveToNotLearnt(letter);
            }
        }
    });
    
    // Listens for click on "prew arrow" (write-hard)
    $(".level-write-hard #prew-arrow").click(function(e) {
        e.preventDefault();
        if ($("#prew-arrow").attr("href") === "prew") {
            disableFlags("both");
            histPtr--;
            getAndDisplayHistoryWrite();
            $(".level-write-hard #next-arrow").attr("href", "next");
            if(histPtr == 0){
                $("#prew-arrow").removeAttr("href");
            }
        }
    });
    
    // Listens for click on "next arrow" (write-hard)
    $(".level-write-hard #next-arrow").click(function(e) {
        e.preventDefault();
        if ($("#next-arrow").attr("href") === "next") {
            histPtr++;
            if(histPtr == ansHist.length){  // New letter
                enableFlags("both");
                selectAndDisplayNewLetterWriteHard(window.alphabet,"easy");
                $(".level-write-hard #next-arrow").removeAttr("href");
                if(histPtr != 0){
                    pushHistoryWriteHard(0); // push to history and mark as unanswered
                }
            }
            else if(histPtr == ansHist.length-1 && ansHist[histPtr][1] == 0){   // Chosen letter is not answered
                enableFlags("both");
                DisplayNewLetterWriteHard(ansHist[histPtr][0]);
            }
            else if(histPtr == ansHist.length-1 && ansHist[histPtr][1] == 1){   // Chosen letter is answered
                $(".level-write-hard #next-arrow").attr("href", "next");
                getAndDisplayHistoryWrite();
            }
            else{   // Chosen letter is answered
                getAndDisplayHistoryWrite();
            }
            $(".level-write-hard #prew-arrow").attr("href", "prew");
            if(histPtr == ansHist.length-1 && ansHist[histPtr][1] == 0)$(".level-write-hard #next-arrow").removeAttr("href");
        }
    });
  
    /*
     *     FLAGS (drag-and-rotate) MOVEMENT
     */
    
    // RIGHT
    // Event listener for click-and-drag of right flag
    document.getElementById("imageRightFlag").addEventListener("mousedown",function(e){
         e.preventDefault();
        if($("#imageRightFlag").attr("href") === "enabled"){
            window.document.addEventListener("mousemove", mouseMoveRight,true);
            
            window.document.addEventListener("mouseup",function a(e){
                e.preventDefault();
                window.document.removeEventListener("mousemove", mouseMoveRight,true);
                fixPosition("right");
                window.document.removeEventListener("mouseup", a,true);
            },true);
        }
    });    

    
    // Function for tracking mouse movements
    function mouseMoveRight(e) {
        //Izracun centra kroznice in pozicije miske
        var centerMis = [e.clientX, e.clientY];
        
        //Izracun kota premika
        var degree = Math.atan2(centerMis[0] - middlePointRight[0], -(centerMis[1] - (middlePointRight[1] - window.scrollY)))* (180 / Math.PI);
        
        //Rotacije za vse brskalike
        var objFlagRight = $("#imageRightFlag");
        objFlagRight.css('-moz-transform', 'rotate('+degree+'deg)');
        objFlagRight.css('-webkit-transform', 'rotate('+degree+'deg)');
        objFlagRight.css('-o-transform', 'rotate('+degree+'deg)');
        objFlagRight.css('-ms-transform', 'rotate('+degree+'deg)');
    }
    
     
    // LEFT
    // Event listener for click-and-drag of right flag
    document.getElementById("imageLeftFlag").addEventListener("mousedown",function(e){
        e.preventDefault();
        if($("#imageLeftFlag").attr("href") === "enabled"){
            window.document.addEventListener("mousemove", mouseMoveLeft,true);
    
            window.document.addEventListener("mouseup",function a(e){
                e.preventDefault();
                window.document.removeEventListener("mousemove", mouseMoveLeft,true);
                fixPosition("left");
                window.document.removeEventListener("mouseup", a,true);
            },true);
        }
    });    
    
    // Function for tracking mouse movements
    function mouseMoveLeft(e) {
        // Center of rotation and position of mouse
        var centerMis = [e.clientX, e.clientY];
        
        // Angle of rotation
        var radians = Math.atan2(centerMis[0] - middlePointLeft[0], centerMis[1] - (middlePointLeft[1] - window.scrollY));
        var degree = (radians * (180 / Math.PI)*-1)+180; 
        
        // Rotation for all browsers
        var objFlagLeft = $("#imageLeftFlag");
        objFlagLeft.css('-moz-transform', 'rotate('+degree+'deg)');
        objFlagLeft.css('-webkit-transform', 'rotate('+degree+'deg)');
        objFlagLeft.css('-o-transform', 'rotate('+degree+'deg)');
        objFlagLeft.css('-ms-transform', 'rotate('+degree+'deg)');
    }
});

/* *************************************************************************** */
/* *******************************   CODE  *********************************** */
/* *************************************************************************** */

// Selects new letter, displays the picture and choices
function selectAndDisplayNewLetter(alphabet, mode) {
    var letter = selectNewLetter(alphabet);
    var choices = selectChoices(alphabet, letter);
    $("#read_medium_solution").removeAttr("disabled");
    
    displayNewLetter(letter,mode,choices);
}

// Displays given letter
function displayNewLetter(letter,mode,choices) {
    $(".level-read-"+mode+" #picture-letter img").attr("src", flagsDir + letter + ".png");

    // Clears inputs and options
    if(mode === "easy") {
        clearSelectedOptions("choices", choices);
    } else if( mode === "medium") {
        clearInput("letterInput");
    }
}

// Displays old letter (popravi sliko in izbire)
function displayOldLetter(corrLetter, choices){
    var ans = ansHist[histPtr][0].split(",");
    var buttons = document.getElementById('choices'),button;
    var j = 0;
    for(var i = 0; i < buttons.children.length; i++){
        button = buttons.children[i];
        var letter = (ans[j].split(""))[0];
        var colour = (ans[j].split(""))[1];
        if(colour == 'I'){
            button.className = "btn btn-info btn-letter";
        }
        else if(colour == 'D'){
            button.className = "btn btn-letter btn-danger";
        }
        else if(colour == 'S'){
            button.className = "btn btn-letter btn-success";
            $(".level-read-easy #picture-letter img").attr("src", flagsDir + letter.toLowerCase() + ".png");
        }
        button.innerHTML = letter;
        button.disabled=false;
        j++;
    }
    $(".level-read-easy #picture-letter img").attr("src", flagsDir + corrLetter.toLowerCase() + ".png");
    if(histPtr === 0){
        $(".level-read-easy #prew-arrow").removeAttr("href");
    }else{
        $(".level-read-easy #prew-arrow").attr("href", "prew");
    }
    $(".level-read-easy #next-arrow").attr("href", "next");
}
// Function for geting leters from history (Read-easy) - returns string
function getChoices(choices){
    var string = [];
    choices = choices.split(",");
    for(var i = 0; i < choices.length; i++){
        string.push(choices[i].charAt(0));
    }
    return string;
}

// Display Letter from history that has not been answ.
function displayOldLetterMedium(ansHist){
    // Display image
    $("#picture-letter img").attr("src", flagsDir + ansHist[2].toLowerCase() + ".png");
    // Display old input
    var inputClass = ansHist[0].split("-")[1];
    var ans = ansHist[0].split("-")[0];
    $("#letterInput").attr("class", inputClass);
    $("#letterInput").val(ans);
    $("#letterInput").removeAttr("disabled");
}

// Function selects and displays new letter
function selectAndDisplayNewImage(alphabet, mode) {
    var letter = selectNewLetter(alphabet);
    var choices = selectChoices(alphabet, letter);
    
    $("#letterToGuess span").text(letter.toUpperCase());
    clearSelectedImages("#coreLogic #picture-letter", choices);
}

// Function selects
function selectNewLetter(alphabet) {
    /*
    for (var i = 0; i < alphabet.length; i++) {
        console.log(alphabet[i] + ": " + userAnswers[alphabet[i]]);
    }
    */
    // Poisci najslabse poznano crko (pazi, da ni enaka prejsnji prikazani crki)
    var worseNumber;
    if (prevLetter === "a") {
        worseNumber = userAnswers["b"];
    } else {
        worseNumber = userAnswers["a"];
    }
    for (var i = 1; i < alphabet.length; i++) {
        if (userAnswers[alphabet[i]] < worseNumber && alphabet[i] !== prevLetter) {
            worseNumber = userAnswers[alphabet[i]];
        }
    }

    // ustvari novo tabelo, kamor shrani kandidate za prikaz - vse, ki imajo vrednost v tabeli (worseNumber + 1) ali manj
    var selectFrom = [];
    for (var i = 0; i < alphabet.length; i++) {
        if (userAnswers[alphabet[i]] <= worseNumber + 1 && alphabet[i] !== prevLetter) {
            selectFrom.push(alphabet[i]);
        }
    }
    //console.log("selectFrom: " + selectFrom);
    prevLetter = selectFrom[Math.floor(Math.random() * selectFrom.length)];
    return prevLetter;
}

// Function selects new Word
function selectNewWord(words) {
    words = words.split(", ");
    var word = words[Math.floor(Math.random() * words.length)];
    var re = new RegExp("&#39;", 'g');
    word = word.replace(re, "");
    word = word.replace("[","");
    word = word.replace("]","");
    return word;
}

// Function selects new choices
function selectChoices(alphabet, letter) {
    var choices=[];
    choices[0] = letter;
    for(var i = 1; i < 4; i++){
        var tmp = alphabet[Math.floor(Math.random() * alphabet.length)];
        if(choices.includes(tmp)){
            i--;
            continue;
        }
        else{
           choices[i] = tmp;
        }
    }
    shuffle(choices);
    return choices;
}

// Function clears selected options
function clearSelectedOptions(elementID, choices) {
    var buttons = document.getElementById(elementID),button;
    var j = 0;
    for(i = 0; i < buttons.children.length; i++){
        button = buttons.children[i];
        var buttonClass = button.className;
        if(buttonClass !== ""){
             button.className = "btn btn-info btn-letter";
             button.innerHTML = choices[j].toUpperCase();
             button.disabled=false;
             j++;
        }
    }
    $("#next-arrow").removeAttr("href");
    $("#prew-arrow").attr("href", "prew");
}

// Function selects image
function clearSelectedImages(elementID, choices) {
    var i = 0;
    $(elementID).each(function() {
        $(this).find("img").attr("src", flagsDir + choices[i].toLowerCase() + ".png");
        $(this).parent().removeClass("wrongInput");
        $(this).parent().removeClass("correctInput");
        i++;
    });
    $("#next-arrow").removeAttr("href");
    $("#prew-arrow").attr("href", "prew");
}

// Function displays sequence of images
function displaySequenceOfImages(elements, index) {
    if (index == $(elements).length) {
        if (getPoints() >= pointsForClueReadHard) {
            //$(".level-read-hard .panel-body .well").append("<img src='" + "/static/" +  "blank.png' class=''>");
            console.log("lahko se enkrat sprozis");
            $("#start-animation").removeAttr("disabled");
            $(elements + ":eq(" + 0 + ")").removeClass("hidden");
        }
    }
    if (index <= $(elements).length) {
        if (index > 0) {
            $(elements + ":eq(" + (index - 1) + ")").addClass("hidden");
        }
        $(elements + ":eq(" + index + ")").removeClass("hidden");

        readHardTimer = setTimeout(function() {
            displaySequenceOfImages(elements, (index + 1))
        }, 1000);
    }
}

/*
// Function disables one choice [random]    <-- not in use
function disableOneChoiceRead(){
    console.log("disable one choice");
    // indexira vse mozne izbire in najde eno rendom
    var buttons = document.getElementById('choices'),button;
    var counter = 0; var posibleOptions = [];
    var corrLetter = getLetterFromURL($("#picture-letter img").attr('src'));
    for(var i = 0; i < buttons.children.length; i++){
        button = buttons.children[i];
        var buttonClass = button.className;
        var buttonLetter = button.innerHTML;
        console.log("disabled: "+button.disabled);
        var disabled = button.disabled;
        if(buttonClass.includes("btn-info") && buttonLetter.toLowerCase() != corrLetter.toLowerCase() && !disabled){
            console.log("pusham");
           posibleOptions.push(button);
           counter++;
        }
    }
    if(counter > 0){
    var index = Math.floor(Math.random() * counter);
    var selectet = posibleOptions[index];
    selectet.disabled = true;
    pointsForRightAnswerReadEasy--;
    }
}
*/ 

// Function clears input
function clearInput(elementID) {
    document.getElementById(elementID).value="";
    document.getElementById(elementID).disabled = false;
    $(elementID).removeClass("correctInput");
    $(elementID).removeClass("wrongInput");
    $("#next-arrow").removeAttr("href");
    $("#prew-arrow").attr("href", "prew");
}

// Function puts focus on next wrong input
function focusNext(event, elementToFocus) {
    var char = event.which || event.keyCode;
    if (isLetter(String.fromCharCode(char))) {
        var numOfLetters = $(".letterInputClass").length;
        while (numOfLetters >= 0 && $(elementToFocus).attr("disabled") == "disabled") {
            // Find first field which is not disabled
            elementToFocus = $(elementToFocus).next(".letterInputClass");
            numOfLetters--;
        }
        $(elementToFocus).focus().select();
    }
}

// Function puts focus on first free input
function focusFirstFree(elementToFocus) {
    var numOfLetters = $(".letterInputClass").length;
    while (numOfLetters >= 0 && $(elementToFocus).attr("disabled") == "disabled") {
        // Najdi prvo polje, ki ni disabled
        elementToFocus = $(elementToFocus).next(".letterInputClass");
        numOfLetters--;
    }
    $(elementToFocus).focus().select();
}

// Function move element to learned
function moveToLearnt(element) {
    element = element.toLowerCase();
    userAnswers[element]++;
}

// Function move element to not learned
function moveToNotLearnt(element) {
    element = element.toLowerCase();
    userAnswers[element]--;
}

function refresh() {
    // Called every time when new letter/word is displayed
    // Empty, may be used later
}


/* *************************************************************************** */
/* *****************************   HISTORY  ********************************** */
/* *************************************************************************** */

//Function adds current answer to history - READ_EASY [push=0/set=1, !ans=0/ans=1]
function addHistoryEasy(set,ans){
    var state="";
    var buttons = document.getElementById('choices'),button;
    var corrLetter = getLetterFromURL($("#picture-letter img").attr('src'));
    for(var i = 0; i < buttons.children.length; i++){
        button = buttons.children[i];
        var buttonClass = button.className;
        var buttonLetter = button.innerHTML;
        if(state!="")state+=",";
        if(buttonClass.includes("btn-info")){
           state+=buttonLetter+"I"
        }
        else if(buttonClass.includes("btn-danger")){
            state+=buttonLetter+"D"
        }
        else if(buttonClass.includes("btn-success")){
            state+=buttonLetter+"S"
        }
    }
    if(set == 1) ansHist[histPtr]=[state,ans,corrLetter]; // ,pointsForRightAnswerReadEasy <-- not in use
    else ansHist.push([state,ans,corrLetter]); // ,pointsForRightAnswerReadEasy <-- not in use
}

// Function adds prev. answer from history - READ_EASY
function restoreHistoryEasy(){
    var ans = ansHist[histPtr][0].split(",");
    var buttons = document.getElementById('choices'),button;
    var j = 0;
    for(var i = 0; i < buttons.children.length; i++){
        button = buttons.children[i];
        var letter = (ans[j].split(""))[0];
        var colour = (ans[j].split(""))[1];
        if(colour == 'I'){
            button.className = "btn btn-info btn-letter";
        }
        else if(colour == 'D'){
            button.className = "btn btn-letter btn-danger";
        }
        else if(colour == 'S'){
            button.className = "btn btn-letter btn-success";
            $(".level-read-easy #picture-letter img").attr("src", flagsDir + letter.toLowerCase() + ".png");
        }
        button.innerHTML = letter;
        button.disabled=true;
        j++;
    }
    if(histPtr === 0){
        $(".level-read-easy #prew-arrow").removeAttr("href");
    }else{
        $(".level-read-easy #prew-arrow").attr("href", "prew");
    }
    $(".level-read-easy #next-arrow").attr("href", "next");
}

// Function adds current answer to history - READ_MEDIUM [push=0/set=1, !ans=0/ans=1]
function addHistoryMedium(set, ans){
    var input = (document.getElementById('letterInput')).value;
    var corrLetter = getLetterFromURL($("#picture-letter img").attr('src'));
    var stateOfAns = $("#letterInput").attr('class');
    var state = input + "-" +stateOfAns;
    if(set == 1){
        ansHist[histPtr]=[state,ans,corrLetter];
    }
    else{
        ansHist.push([state,ans,corrLetter]);
    }
}

// Function adds prev. answer from history - READ_MEDIUM
function restoreHistoryMedium(){
    var output = ansHist[histPtr][0].split("-")[0];
    (document.getElementById('letterInput')).value = output;
    document.getElementById('letterInput').disabled = true;
    $(".level-read-medium #picture-letter img").attr("src", flagsDir + output.toLowerCase() + ".png");
    if(histPtr === 0){
        $(".level-read-medium #prew-arrow").removeAttr("href");
    }else{
        $(".level-read-medium #prew-arrow").attr("href", "prew");
    }
    $(".level-read-medium #next-arrow").attr("href", "next");
    $("#read_medium_solution").attr("disabled", "disabled");
    $("#letterInput").removeClass().addClass("correctInput");
} 

// Function adds current answer to history - WRITE_EASY
function addHistoryWriteEasy(set, ans){
    var state="";
    var buttons = document.getElementById('choices');
    for(var i = 0; i < buttons.children.length; i++){
        var buttonClass = (buttons.children[i]).getElementsByTagName('div')[0].className;
        var buttonLetter = getLetterFromURL((((buttons.children[i]).getElementsByTagName('div')[0]).getElementsByTagName('img')[0].src));
        console.log("CRKA: " + buttonLetter);
        if(state!="")state+=",";
        if ($(buttons.children[i]).find(".image_option").hasClass("wrongInput")) {
            state+=buttonLetter+"D"
        } else if ($(buttons.children[i]).find(".image_option").hasClass("correctInput")) {
            state+=buttonLetter+"S"
        } else {
            state+=buttonLetter+"I"
        }
    }
    var corrLetter = $("#letterToGuess span").text();
    console.log("dodal bom v zgodovino: "+state);
    if(set == 1) ansHist[histPtr]=[state,ans,corrLetter];
    else ansHist.push([state,ans,corrLetter]);
}

// Function adds sequence to hisrory [string, 0=not anws.//1=anws]
function pushHistoryReadHard(ans){
    //Najprej pridobi niz iz imen
    var pictures = $(".level-read-hard .panel-body .well").html().split(".png");
    var string="";
    for(var i = 0; i < pictures.length -1; i++){
        string+=pictures[i].slice(-1);
    }
    var state="";
    var index = 0;
    $("#input-string-hard .letterInputClass").each(function(index) {
        var input = $(this).val();
        var ansClass = $(this).attr('class');
        if(index != 0)state+=",";
        state += input+"-"+ansClass;
        index++;
        console.log("pridobil sem info za zgodovino: "+input+" "+ansClass);
    });
    ansHist.push([string,ans,state]);
}

// Function sets history  [string, 0=not anws.//1=anws]
function setHistoryReadHard(ans){
    var pictures = $(".level-read-hard .panel-body .well").html().split(".png");
    var string="";
    for(var i = 0; i < pictures.length -1; i++){
        string+=pictures[i].slice(-1);
    }
    var state="";
    var index = 0;
    $("#input-string-hard .letterInputClass").each(function(index) {
        var input = $(this).val();
        var ansClass = $(this).attr('class');
        if(index != 0)state+=",";
        state += input+"-"+ansClass;
        index++;
        console.log("pridobil sem info za zgodovino: "+input+" "+ansClass);
    });
    ansHist[histPtr] = [string,ans,state];
}

// Function restores and displays history on current histPtr
function restoreHistoryReadHard(){
    var string = ansHist[histPtr][0];
    // Clean up
    $(".level-read-hard .panel-body .well").html("");
    $("#input-string-hard").html("");
    $("#start-animation").attr("disabled", "disabled");
    $("#start-animation").removeClass("used");
    $("#start-animation").text("Začni!");
    clearTimeout(readHardTimer);

    var letters = string.split("");
    var idNumber = 1;
    for (i = 0; i < letters.length; i++) {
        var letter = letters[i];
        $(".level-read-hard .panel-body .well").append("<img src='" + flagsDir + letter + ".png' class='hidden'>");
        $("#input-string-hard").append('<input id="num' + idNumber + '" class = "letterInputClass correctInput" type="text" maxlength="1" value = "' + letter + '">');
        idNumber++;
    }
    // Enable input
    textFieldsDisable(".letterInputClass");
    $("#start-animation").css("visibility", "hidden");
    // Show sequence of images
    displaySequenceOfImages(".level-read-hard .well img", 0);
}

// Function restores given word as unanswered
function restoreStringReadHard(word){
    // Clean up
    console.log("Vsebina zgodovine: "+ansHist[histPtr]);
    $(".level-read-hard .panel-body .well").html("");
    $("#input-string-hard").html("");
    $("#next-arrow").removeAttr("href");
    $("#start-animation").removeAttr("disabled");
    $("#start-animation").removeClass("used");
    $("#start-animation").text("Začni!");
    clearTimeout(readHardTimer);

    var letters = word.split("");
    var idNumber = 1;
    var state = ansHist[histPtr][2].split(",");
    for (i = 0; i < letters.length; i++) {
        var letter = letters[i];
        $(".level-read-hard .panel-body .well").append("<img src='" + flagsDir + letter + ".png' class='hidden'>");
        var prevAns = state[i].split("-")[0];
        var prevClass = state[i].split("-")[1];
        $("#input-string-hard").append('<input id="num' + idNumber + '" class = "'+prevClass+'" type="text" maxlength="1" onkeyup="focusNext(event, \'#num' + (idNumber+1) + '.letterInputClass\') "value = '+prevAns+'>');
        idNumber++;
    }
    
}

// Function adds prev. answer from history - WRITE_EASY
function restoreHistoryWriteEasy(){
    var ans = ansHist[histPtr][0].split(",");
    var buttons = document.getElementById('choices');
    imageButtonsDisable($("#choices"));
    var j = 0;
    for(var i = 0; i < buttons.children.length; i++){
        var letter = (ans[j].split(""))[0];
        var colour = (ans[j].split(""))[1];
        // adds class
        if(colour == 'I'){
            console.log("I");
            $(buttons.children[i]).find(".image_option").removeClass("wrongInput").removeClass("correctInput");
            $(buttons.children[i]).find(".image_option img").attr("src", flagsDir + letter.toLowerCase() + ".png");
        }
        else if(colour == 'D'){
            console.log("D");
            $(buttons.children[i]).find(".image_option").addClass("wrongInput").removeClass("correctInput");
            $(buttons.children[i]).find(".image_option img").attr("src", flagsDir + letter.toLowerCase() + ".png");
        }
        else if(colour == 'S'){
            console.log("S");
            $(buttons.children[i]).find(".image_option").addClass("correctInput").removeClass("wrongInput");
            $(buttons.children[i]).find(".image_option img").attr("src", flagsDir + letter.toLowerCase() + ".png");
            $("#letterToGuess span").text(letter.toUpperCase());
        }
        j++;
    }
    var corrLetter = $("#letterToGuess span").text();
    if(histPtr === 0){
        $(".level-write-easy #prew-arrow").removeAttr("href");
    }else{
        $(".level-write-easy #prew-arrow").attr("href", "prew");
    }
    $(".level-write-easy #next-arrow").attr("href", "next");
}

// Function displays letter
function displayOldLetterWriteEasy(corrLetter, choices){
    var ans = choices.split(",");
    var buttons = document.getElementById('choices');
    imageButtonsDisable($("#choices"));
    var j = 0;
    for(var i = 0; i < buttons.children.length; i++){
        var letter = (ans[j].split(""))[0];
        var colour = (ans[j].split(""))[1];
        if(colour == 'I'){
            $(buttons.children[i]).find(".image_option").removeClass().addClass("image_option");
            $(buttons.children[i]).find(".image_option img").attr("src", flagsDir + letter.toLowerCase() + ".png");
        }
        else if(colour == 'D'){
            $(buttons.children[i]).find(".image_option").removeClass().addClass("image_option wrongInput not_active");
            $(buttons.children[i]).find(".image_option img").attr("src", flagsDir + letter.toLowerCase() + ".png");
        }
        else if(colour == 'S'){
            $(buttons.children[i]).find(".image_option").removeClass().addClass("image_option correctInput");
            $(buttons.children[i]).find(".image_option img").attr("src", flagsDir + letter.toLowerCase() + ".png");
        }
        j++;
    }
    $("#letterToGuess span").text(corrLetter.toUpperCase());
    if(histPtr === 0){
        $(".level-write-easy #prew-arrow").removeAttr("href");
    }else{
        $(".level-write-easy #prew-arrow").attr("href", "prew");
    }
    $(".level-write-easy #next-arrow").attr("href", "next");
}



/* *************************************************************************** */
/* *****************************  COOKIES  *********************************** */
/* *************************************************************************** */
                    /* COOKIES - stores number of points */

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie(cname) {
    var points = getCookie(cname);
    if (points != "") {
        setPoints(points);
    } else {
        points = 0;
        setCookie(cname, points, expDays);
    }
}

function setPoints(points) {
    $("#points #points-display").text(Number(points));
}

function addPoints(pointsAdded) {
    var pointsNow = Number($("#points #points-display").text()) + pointsAdded;
    setPoints(pointsNow);
    setCookie(cookie_name, pointsNow, expDays);
}

function removePoints(pointsRemoved) {
    var pointsNow = Number($("#points #points-display").text()) - pointsRemoved;
    if (pointsNow < 0) {
        pointsNow = 0;
    }
    setPoints(pointsNow);
    setCookie(cookie_name, pointsNow, expDays);
}

function getPoints() {
    return Number($("#points #points-display").text());
}


/* *************************************************************************** */
/* *****************   FLAG ROTATION (WRITE - medium & hard)  **************** */
/* *************************************************************************** */

// Boolean function for checking correct position (Hard)
function checkIfCorrWrite(){
    var letter = $("#letterToGuess span").text().toLowerCase();
    if(positions[letter][0] == curHandPos[0] && positions[letter][1] == curHandPos[1]) return true;
    else return false;
}

// Function for checking if one flag is correct
function checkIfOneIsCorrWrite(){
    var letter = $("#letterToGuess span").text().toLowerCase();
    if(positions[letter][1] == curHandPos[1]){
        disableFlags("left");
        return true;
    }
    else if(positions[letter][0] == curHandPos[0]){ //-right
        disableFlags("right");
        return true;
    }
    else return false;
}

//Function checks if position is another valid letter
function checkIfOtherCorrLetterWrite(){
    for(var letter in positions){
        if(letter != "init" && positions[letter][0] == curHandPos[0] && positions[letter][1] == curHandPos[1]){
            //flash right letter
            flashRightLetter(letter);
            return true;
        }
    }
    return false;
}

//Function flashes letter that corresponds to current position
function flashRightLetter(letter){
    var letterOld = $("#letterToGuess span").text();
    
    $("#letterToGuess span").fadeOut(150, function(){
        $("#letterToGuess span").text(letter.toUpperCase());
        $("#letterToGuess span").fadeIn(150, function(){
            setTimeout(function(){
                $("#letterToGuess span").fadeOut(150, function(){
                    $("#letterToGuess span").text(letterOld.toUpperCase());
                    $("#letterToGuess span").fadeIn(150, function(){ });
                });
            }, 150);
        });
    });
}


// Function marks check image appropriately (1-corect // 0-err // 2-normal)
function markCheckControlWrite(status){
    var tmp = $("#check img").attr("src");
    if(status == 1){
        $("#check img").attr("src",staticDir + "check_correct.png");
        disableFlags("both");
    }
    else if(status == 0){
        $("#check img").attr("src", staticDir + "check_err.png");
        $("#check img").attr("href", "enabled");
    }
    else{
        $("#check img").attr("src", staticDir + "check.png");
        $("#check img").attr("href", "enabled");
    }
}

// Function for disabeling check mark
function disableCheckControlWrite(){
   $("#check").removeAttr("href");
}

// Function for enabeling check mark
function enableCheckControlWrite(){
   $("#check").attr("href","enabled");
}

//Function for geting and displaying history
function getAndDisplayHistoryWrite(){
    var letter = ansHist[histPtr][0];
    displHistWrite(letter);
    disableCheckControlWrite();
    markCheckControlWrite(1);
}

// Function for displaying history
function displHistWrite(letter){
    $("#letterToGuess span").text(letter.toUpperCase());
    setFlagPosition("right",positions[letter][0]);
    setFlagPosition("left",positions[letter][1]);
}

// Function for adding to history [letter, answ (0 - no // 1 - yes)] (Write-hard)
function pushHistoryWriteHard(state){
    var letter = $(".level-write-hard #letterToGuess span").text().toLowerCase();
    ansHist.push([letter,state]);
}

// Function for seting input in history [letter, answ (0 - no // 1 - yes)] (Write-hard)
function setHistoryWriteHard(state){
    var letter = $(".level-write-hard #letterToGuess span").text().toLowerCase();
    ansHist[histPtr]=([letter,state]);
}

// Function for adding to history [letter, answ (0 - no // 1 - yes), fixed hand (0 - right // 1 - left // 2 - both)] (Write-medium)
function pushHistoryWriteMedium(state){
    var letter = $(".level-write-medium #letterToGuess span").text().toLowerCase();
    if($("#imageLeftFlag").attr("href") !== "enabled")ansHist.push([letter,state,1]);
    else ansHist.push([letter,state,0]);
}

// Function for seting input in history [letter, answ (0 - no // 1 - yes), fixed hand (0 - right // 1 - left)] (Write-medium)
function setHistoryWriteMedium(state){
    var letter = $(".level-write-medium #letterToGuess span").text().toLowerCase();
    ansHist[histPtr]=([letter,state,2]);
}

// Function for selecting and displaying new option (Hard)
function selectAndDisplayNewLetterWriteHard(alphabet){
    var letter = selectNewLetter(alphabet);
    DisplayNewLetterWriteHard(letter);
}

// Function for displaying letter to write (Hard)
function DisplayNewLetterWriteHard(letter){
    $("#letterToGuess span").text(letter.toUpperCase());
    setFlagPosition("right",positions["init"][0]);
    setFlagPosition("left",positions["init"][1]);
    enableFlags("both");
    markCheckControlWrite(2);
    enableCheckControlWrite();
}

// Function for selecting and displaying new option (Medium)
function selectAndDisplayNewLetterWriteMedium(alphabet){
    var letter = selectNewLetter(alphabet);
    DisplayNewLetterWriteMedium(letter);
}

// Function for displaying letter to write (Medium)
function DisplayNewLetterWriteMedium(letter){
    $("#letterToGuess span").text(letter.toUpperCase());
    if(histPtr == ansHist.length){
        setFlagPosition("right",positions["init"][0]);
        setFlagPosition("left",positions["init"][1]);
        setFlagsMedium(2);
    }
    else if(ansHist[histPtr][2] == 0){
        setFlagPosition("left",positions["init"][1]);
        setFlagsMedium(0);
    }
    else{
        setFlagPosition("right",positions["init"][0]);
        setFlagsMedium(1);
    }
    markCheckControlWrite(2);
    enableCheckControlWrite();
}

// Function for fixed position of flag to nearest posible angle
function  fixPosition(flag){
    var flagElem, angle;
    if(flag === "right"){
        flagElem = $("#imageRightFlag");
        angle = calculateAngleOfFixedFlag(flagElem);
        if (angle == 360) angle = 0;
        curHandPos[0] = angle;
    }
    else if(flag === "left"){
        flagElem = $("#imageLeftFlag");
        angle = calculateAngleOfFixedFlag(flagElem);
        if (angle == 360) angle = 0;
        curHandPos[1] = angle;
    }
    flagElem.css('transform', 'rotate('+angle+'deg)');
}

// Function fo calculating angle of nearest posible position
function calculateAngleOfFixedFlag(el){
    var matrixOfTransform = el.css("transform");
    // Conversion of matrix to angle (deg)
    var values = matrixOfTransform.substring(7).split(",");
    var a = values[0], b = values[1];
    var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
    if(angle < 0)angle += 360;

    var modulo = Math.floor(angle/45); // <- bottom value (0 || 1 || ... || 7) * 45
    var reminder = angle%45;
    var fixedAngle = modulo*45;
    if(reminder > 22.5){
        fixedAngle += 45;
    }
    return fixedAngle;
}

// Function fo start position (initialization)
function setFigure(){
    var containerHeight = 300, containerWidth = 400;
    // Sets the size of div-container
    $('#imageCointainer').attr("style","height:"+containerHeight+"px; width:"+containerWidth+"px;");
    
    // Sets the base figure size adn position
    var basicFigureHeight = 2/3* containerHeight; 
    var basicFigureTop = (containerHeight - basicFigureHeight)/2;
    $("#imageBasicFigure").attr("style","height:"+basicFigureHeight+"px; top:"+basicFigureTop+"px");
    
    // Sets size adn position of right flag
    var rightFlagHeight = 1/2* containerHeight; 
    var rightFlagTop = rightFlagHeight*0.18;
    $("#imageRightFlag").attr("style","height:"+rightFlagHeight+"px; top:-"+rightFlagTop+"px"); 
    
    // Sets size adn position of right flag
    var leftFlagHeight = 1/2* containerHeight; 
    var leftFlagTop = leftFlagHeight*0.18;
    $("#imageLeftFlag").attr("style","height:"+leftFlagHeight+"px; top:-"+leftFlagTop+"px"); 
    
    // Sets center point of rotation
    var objFlagRight = $("#imageRightFlag");
    var centerKrozRight = [(objFlagRight.offset().left+(objFlagRight.width())),(objFlagRight.offset().top+objFlagRight.height())];
    middlePointRight = centerKrozRight;
    
    var objFlagLeft = $("#imageLeftFlag");
    var centerKrozLeft = [(objFlagLeft.offset().left),(objFlagLeft.offset().top+objFlagLeft.height())];
    middlePointLeft = centerKrozLeft;
    
    // Enables Flags
    enableFlags("both");
}

// Function for setting flags (Medium) [fixedSide = 0 - right, 1 - left, 2 - random]
function setFlagsMedium(fixedSide){
    if(fixedSide == 2) fixedSide = Math.round(Math.random());
    var letter = $("#letterToGuess span").text().toLowerCase();
    if(fixedSide == 1){
        //LEFT is disabled
        setFlagPosition("left",positions[letter][1]);
        disableFlags("left");
    }
    else{
        //RIGHT is disabled
        setFlagPosition("right",positions[letter][0]);
        disableFlags("right");
    }
}

// Function for seting flag in given position
function setFlagPosition(flag,deg){
    if(flag === "right"){
        $("#imageRightFlag").css("transition-duration","1s");
        $("#imageRightFlag").css('transform', 'rotate('+deg+'deg)');
        setTimeout(function() { $("#imageRightFlag").css("transition-duration","0s"); }, 1000); //1,05 sec delay
        curHandPos[0] = deg;
    }
    else if(flag === "left"){
        $("#imageLeftFlag").css("transition-duration","1s");
        $("#imageLeftFlag").css('transform', 'rotate('+deg+'deg)');
        setTimeout(function() { $("#imageLeftFlag").css("transition-duration","0s"); }, 1000); //1,05 sec delay
        curHandPos[1] = deg;
    }
}

// Function for disabling flags movement [right, left, both]
function disableFlags(flag){
    if(flag === "right"){
        $("#imageRightFlag").removeAttr("href");
    }
    else if(flag === "left"){
        $("#imageLeftFlag").removeAttr("href");
    }
    else if(flag === "both"){
        disableFlags("right");
        disableFlags("left");
    }
}

// Function for enabling flags movement [right, left, both]
function enableFlags(flag){
    if(flag === "right"){
        $("#imageRightFlag").attr("href","enabled");
    }
    else if(flag === "left"){
        $("#imageLeftFlag").attr("href","enabled");
    }
    else if(flag === "both"){
        enableFlags("right");
        enableFlags("left");
    }
}



/* *************************************************************************** */
/* **************************   SUPPORT FUNCTIONS  *************************** */
/* *************************************************************************** */

function shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
}

/* Disables all "choices" - buttons */
function buttonsDisable(){
    var buttons = document.getElementById('choices'),button;
    if (buttons) {
        for(var i = 0; i < buttons.children.length; i++){
            button = buttons.children[i];
            button.disabled=true;
        }
    }
}

/* Disables all "choices" - ImageButtons */
function imageButtonsDisable(parent){ //doda class not_active
    console.log("P:" + parent);
    $(parent).find(".image_option").addClass("not_active");
}

function imageOneButtonDisable(element){
    $(element).addClass("not_active");
}

function imageButtonsEnable(parent) {
    $(parent).find(".image_option").removeClass("not_active");
}

function textFieldsDisable(selector) {
    $(selector).each(function() {
       $(this).attr("disabled", "disabled"); 
    });
}

function textFieldsEnable(selector) {
    $(selector).each(function() {
       $(this).removeAttr("disabled"); 
    });
}

/* Returns letter from image link (e. g. returns "k" from "/static/images/flags/k.png") */
function getLetterFromURL(url) {
    var image_link = url.split("/");
    var image_name = image_link[image_link.length - 1];
    var letter = image_name.split(".")[0];
    return letter;
}

/* sleep for "delay" miliseconds */
function sleep(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}

function isLetter(c) {
    return c.toLowerCase() != c.toUpperCase();
}






