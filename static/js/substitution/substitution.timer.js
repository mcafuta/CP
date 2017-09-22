var timer = null;
/**
 * Method loads the global variable used for the timer functionality
 */
function loadTimerDataVariable() {
    timer = (function() {
        var second = null;
        var minute = null;
        var hour = null;
        var count_second = null;
        var count_minute = null;
        var count_hour = null;
        var timerId = null;
        return {
            second: null,
            minute: null,
            hour: null,
            count_second: 0,
            count_minute: 0,
            count_hour: 0,
            timerId : null
        };
    })();
}

/**
 * Fixates the fixed-div to the top right of the page. It serves as a parent
 * div for the timer.
 */
$('#container').scroll(function() {
    $('#fixed-div').css('top', $(this).scrollTop());
});

/**
 * Method starts the timer when the first letter is dragged or typed.
 * The time_second div is added once the timer starts. time_minute div is added
 * once the seconds reach 59 and the time_hours div is added once the minutes
 * reach 59. The divs are updated every second.
 */
function startTimer() {

    if (!timer) {
        loadTimerDataVariable();
        timer.second = true;
        addTimerDiv("pie_second", "time_second", null);

        var span_second = $('#time_second');
        var span_minute = null;
        var span_hour = null;
        var max_time = 60;
        timer.count_second = parseInt(span_second.text());
        timer.count_minute = 0;
        timer.count_hour = 0;
        timer.timerId = setInterval(function () {
            if (timer.count_second >= 59) {
                if (!timer.minute) {
                    addTimerDiv("pie_minute", "time_minute", "pie_second");
                    span_minute = $('#time_minute');
                    timer.count_minute = parseInt(span_minute.text());
                    timer.minute = true
                }
                timer.count_second = 0;
                timer.count_minute++;
                span_minute.html(("0" + timer.count_minute).slice(-2));
            }
            if (timer.count_minute >= 59) {
                if (!timer.hour) {
                    addTimerDiv("pie_hour", "time_hour", "pie_minute");
                    span_hour = $('#time_hour');
                    timer.count_hour = parseInt(span_hour.text());
                    timer.hour = true
                }
                timer.count_minute = 0;
                timer.count_hour++;
                span_hour.html(("0" + timer.count_hour).slice(-2));
            }
            timer.count_second++;
            span_second.html(("0" + timer.count_second).slice(-2));
            updatePieInterval(timer.count_second, max_time, '#pie_second');
            updatePieInterval(timer.count_minute, max_time, '#pie_minute');
            updatePieInterval(timer.count_hour, max_time, '#pie_hour');
        }, 1000);
    }
}

/**
 * Method updates the timer div element.
 * @param {number} percent - Current interval number
 * @param {number} time - Max interval number
 * @param {String} pie - Id of the div to update the pie
 */
function updatePieInterval(percent, time, pie) {
    var deg;
    if (percent < (time / 2)) {
        deg = 90 + (360 * percent / time);
        $(pie).css('background-image',
            'linear-gradient(' + deg + 'deg, transparent 50%, white 50%),linear-gradient(90deg, white 50%, transparent 50%)'
        );
    } else if (percent >= (time / 2)) {
        deg = -90 + (360 * percent / time);
        $(pie).css('background-image',
            'linear-gradient(' + deg + 'deg, transparent 50%, #2e8698 50%),linear-gradient(90deg, white 50%, transparent 50%)'
        );
    }
}

/**
 * Method inserts the timer div inside a fixed div element. Depending on the
 * passed parameters we can create a seconds/minutes/hours timer.
 * @param {String} time_id - Id of the span that hold the interval number
 * @param {String} interval - Interval that we are adding
 * @param {String} append_before - Id of the timer div to insert before
 */
function addTimerDiv(time_id, interval, append_before){
    var fixed_div = document.getElementById("fixed-div");

    var pie_div = document.createElement("div");
    pie_div.setAttribute("id", time_id);
    pie_div.setAttribute("class", "pie");

    var span = createTimerDiv(interval);
    pie_div.appendChild(span[0]);
    pie_div.appendChild(span[1]);

    fixed_div.insertBefore(pie_div, document.getElementById(append_before));
}

/**
 * Method creates a div that holds a two spans, one displays the number of the
 * interval (minutes/seconds/hours) as a number and the other displays a visual
 * representation of the interval.
 * @param {String} time_id - Id of the span that hold the interval number
 */
function createTimerDiv(time_id) {
    var span_block = document.createElement("span");
    span_block.setAttribute("class", "block");

    var span_time = document.createElement("span");
    span_time.setAttribute("class","time");
    span_time.setAttribute("id", time_id);
    span_time.innerHTML = "00";

    return [span_block, span_time]
}