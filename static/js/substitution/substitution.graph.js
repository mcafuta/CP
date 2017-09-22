/**
 * Loads the initial charts. First chart contains frequencies of the letters in
 * the encrypted text and the second contains frequencies of letters in either
 * sl/eng alphabets.
 */
function loadChart() {

    var stats_sl = { 'A':10.5, 'B':2.0, 'C':0.7, 'Č':1.5, 'D':3.4, 'E': 10.7,
        'F':0.1, 'G':1.6, 'H':1.1, 'I': 9.0, 'J':4.7, 'K':3.7, 'L':5.3, 'M':3.3,
        'N': 6.3, 'O':9.1, 'P':3.4, 'R':5.0 , 'S':5.1, 'Š':1.0, 'T':4.3, 'U':1.9,
        'V':3.8, 'Z':2.1, 'Ž':0.7};

    var stats_en = { 'A': 8.2, 'B': 1.5, 'C': 2.8, 'D': 4.2, 'E': 12.7,
        'F': 2.2, 'G': 2.0, 'H': 6.1, 'I': 7.0, 'J': 0.2, 'K': 0.8, 'L': 4.0,
        'M': 2.4, 'N': 6.7, 'O': 7.5, 'P': 1.9, 'Q': 0.1, 'R': 6.0, 'S': 6.3,
        'T': 9.1, 'U': 2.8, 'V': 1.0, 'W': 2.4, 'X': 0.2, 'Y': 2.0 ,'Z': 0.1};

    loadChartDataVariable();
    chartData.currentStats = substitution.util.foreign ? stats_en: stats_sl;
    chartData.plot1_data= getChartData(substitution.util.letterFrequencyDict, 'frequency');
    chartData.plot2_data = getChartData(chartData.currentStats, 'static');
    addSortButton('info-btn-1', "chart1");
    addSortButton('info-btn-2', "chart2");
    drawChart('chart1', chartData.plot1_data);
    drawChart('chart2', sortChartData(chartData.plot2_data[0], chartData.plot2_data[1], 1));
    setChartInfo('chart1', chartData.plot1_data[1]);
    setChartInfo('chart2', chartData.plot2_data[1]);
    loadSlider();
}

/**
 * Method loads the global variable used for the chart functionality
 */
function loadChartDataVariable() {
    chartData = (function() {
        var currentStats = null;
        var plot1 = null;
        var plot2 = null;
        var plot1_data = null;
        var plot2_data = null;
        return {
            plot1: null,
            plot2: null,
            plot1_data: null,
            plot2_data: null,
            currentStats: null
        };
    })();
}

/**
 * Returns the data for the second graph containing the sl/eng frequencies of
 * letters in the alphabet.
 * @param {dictionary} stats - Contains mapping of letters to frequencies
 * @param {string} type - Tells the type of chart data
 * @return {Array}  Returns an array containing series and ticks
 */
function getChartData(stats, type) {

    var keys = Object.keys(stats);

    var series = [];
    var total_keys = 0;
    for (var i = 0; i < keys.length; i++) {
        total_keys += stats[keys[i]];
        series.push(stats[keys[i]]);
    }

    if (type === 'frequency') {
        series = series.map(function(s) {
            return (s/total_keys)*100;
        });
    }

    return [series, keys];
}

/**
 * Method sorts the chart data either by letters or frequencies
 * @param {Array} series - Array of frequencies
 * @param {Array} keys - Array of letters
 * @param {number} sort - Defines the type of the sort
 */
function sortChartData(series, keys, sort) {

    var tuples = [];
    for (var i = 0; i < keys.length; i++) {
        tuples.push([keys[i], series[i]]);
    }

    if (sort == 1) {
        tuples.sort(function(first, second) {
            return second[1] - first[1];
        });
    } else {
        tuples.sort(function (first, second) {
            return first[0].toString().localeCompare(second[0]);
        });
    }

    var s = [];
    var k = [];
    for (var j = 0; j < tuples.length; j++) {
        k.push(tuples[j][0]);
        s.push(tuples[j][1]);
    }
    return [s, k]
}

/**
 * Method sets the information display for each graph, depending of the chart
 * passed as the argument.
 * @param {string} chart - Id of chart
 * @param {Array} ticks - Data on x axis for dispaly
 */
function setChartInfo(chart, ticks) {

    if (chart === 'chart1') {
        $('#chart1').bind('jqplotDataHighlight',
            function (ev, seriesIndex, pointIndex, data) {
                $('#info-msg-1').html('Pojavitev črke:  <strong>' + ticks[pointIndex] + '</strong> v besedilu - ' + data[1].toFixed(1) + '%');
            }
        );

    } else  {
        $('#chart2').bind('jqplotDataHighlight',
            function (ev, seriesIndex, pointIndex, data) {
                $('#info-msg-2').html('Frekvenca črke:  <strong>' + ticks[pointIndex]  + '</strong> v slovenskem jeziku - ' + data[1].toFixed(1) + '%');
            });
    }

}

/**
 * Settings for the chart.
 * @param {Array} ticks - Array containing the occurring letters in the text.
 */
function chartOptions(ticks) {
    return {
        height: 100,
        seriesColors: ['#467892'],
        seriesDefaults: {
            renderer: $.jqplot.BarRenderer,
            pointLabels: {show: true, formatString: '%.1f'},
            dragable: {
                color: '#467892',
                constrainTo: 'y'
            },
            shadow: false
        },
        axes: {
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: ticks
            },
            yaxis: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                drawBaseline: false
            }
        },
        grid: {
            backgroundColor: "#FFFFFF",
            gridLineColor: "#FFFFFF",
            gridLineWidth: 0,
            shadow: false,
            drawBorder: true,
            borderColor: '#467892'
        }
    };
}

/**
 * Returns the data for the second graph containing the sl/eng frequencies of
 * letters in the alphabet.
 * @param {string} chart_id - Id of chart to be drawn
 * @param {Array} data - Array containing series and ticks for display
 */
function drawChart(chart_id, data) {

    var series = data[0];
    var ticks = data[1];

    $(document).ready(function () {

        $.jqplot.config.enablePlugins = true;
        var plot = $.jqplot(chart_id, [series], chartOptions(ticks));

        $(window).resize(function() {
            plot.replot( { resetAxes: true } );
        });

        if (chart_id === 'chart1') {
            chartData.plot1_data = data;
            chartData.plot1 = plot;
        }
        else {
            chartData.plot2_data = data;
            chartData.plot2 = plot
        }
    });
}

/**
 * Method updates the chart with new data. (destroy is used because it is
 * faster than replot)
 * @param {String} chart_id - Id of the chart to be updated
 * @param {Array} data - New data to be filled in the chart.
 */
function updateChart(chart_id, data) {

    var series = data[0];
    var ticks = data[1];

    if (chart_id == 'chart1') {
        chartData.plot1.destroy();
        chartData.plot1 = $.jqplot('chart1', [series], chartOptions(ticks))
        chartData.plot1_data = data
    }
    else {
        chartData.plot2.destroy();
        chartData.plot2 = $.jqplot('chart2', [series], chartOptions(ticks))
        chartData.plot2_data = data
    }
}

/**
 * Method adds a sort button next to the chart info display above the chart.
 * @param {string} info_btn_id - Id of the button to be added
 */
function addSortButton(info_btn_id, chart_id) {
    var info = document.getElementById(info_btn_id);
    var button;

    if (info_btn_id === 'info-btn-1') {
        button = createSortButton("chartSortButton1", chart_id,
            "sortChart(this.id);"
        );
    }
    else {
        button = createSortButton("chartSortButton2", chart_id,
            "sortChart(this.id);"
        );
    }
    info.appendChild(button);
}

/**
 * Method creates the chart sort button.
 * @param {String} button_id - Id that the button will get
 * @param {String} chart_id - Id that the button will get
 * @param {String} function_name - Function that will be called when the button
 * is clicked
 * @returns {Object} Returns the newly created button
 */
function createSortButton(button_id, chart_id, function_name) {
        var button = document.createElement("button");
        button.setAttribute("value", "0");
        button.setAttribute("id", button_id);
        button.setAttribute("data-chart-id", chart_id);
        button.setAttribute("class","btn btn-default btn-sm");
        button.setAttribute("onclick", function_name);
        button.textContent = "Sortiraj po abecedi";
        return button;
}

/**
 * Method sorts the data depending of the value of the clicked button.
 * Afer the data is sorted it is re-displayed.
 * @param {String} button_id - Id that the button
 */
function sortChart(button_id) {
    var btn = document.getElementById(button_id);
    var chart_id = btn.getAttribute("data-chart-id");
    var data;
    if (chart_id === "chart1") {
        data = sortChartData(chartData.plot1_data[0], chartData.plot1_data[1], btn.value);
    }
    else {
        data = sortChartData(chartData.plot2_data[0], chartData.plot2_data[1], btn.value);
    }

    if (btn.value === '0' ) {
        btn.setAttribute('value', '1');
        btn.textContent = "Sortiraj po frekvenci";
    }
    else {
        btn.setAttribute('value', '0');
        btn.textContent = "Sortiraj po abecedi";
    }

    updateChart(chart_id, data);
}

/**
 * Method loads the slider handle. Depending on the position of the handle
 * the chart is shifted left or right.
 */
function loadSlider() {
    $(document).ready(function () {
        var handle = $("#custom-handle");
        var max = Object.keys(chartData.currentStats).length;
        $("#slider").slider({
            min: 0,
            max: max,
            value: 0,
            create: function() {
                handle.text( $( this ).slider( "value" ));
            },
            slide: function( event, ui ) {
                var data = chartData.plot2_data;
                var ticks = data[1].slice(0);
                var series = data[0].slice(0);
                var shifted = handle.text() - ui.value;
                if (shifted > 0) {
                    var removed = ticks.splice(0,shifted);
                    ticks = ticks.concat(removed);
                    series = series.concat(series.splice(0,shifted));
                }
                else {
                    var remove = ticks.splice((ticks.length)-Math.abs(shifted),Math.abs(shifted));
                    ticks =  remove.concat(ticks);
                    remove = series.splice((series.length)-Math.abs(shifted), Math.abs(shifted));
                    series =  remove.concat(series);
                }
                handle.text( ui.value );
                updateChart('chart2', [series, ticks]);
            }
        });
    });
}