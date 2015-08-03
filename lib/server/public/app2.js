(function () {
	var chart;

	init();

	function init() {

		Highcharts.setOptions({
            		global: {
                		useUTC: false
            		}
        	});


		$('#chart').highcharts({
		    chart: {
			type: 'line',
			animation: false, 
			events: {
			    load: function () {
				var series = this.series[0];
				var websocket = new WebSocket('ws://192.168.1.5:3080/live');
                		websocket.onmessage = function (e) {
                        		var x = (new Date()).getTime();
                        		var y = parseFloat(e.data) || 0;
                        		series.addPoint([x, y], true, true);
                		}
			    }
			}
		    },
		    turboThreshold: 8000,
		    title: {
			text: 'Sensor Readings'
		    },
		    xAxis: {
			type: 'datetime',
			tickPixelInterval: 150
		    },
		    yAxis: {
			title: {
			    text: 'Value'
			},
			plotLines: [{
			    value: 0,
			    width: 1,
			    color: '#808080'
			}],
			min: -45,
			max: 45
		    },
		    legend: {
			enabled: false
		    },
		    exporting: {
			enabled: false
		    },
		    plotOptions: {
		    	series: {
				turboThreshold: 8000
			},
			dataGrouping: {
				enabled: false
			}
		    },
		    series: [{
			name: 'Sensor Readings',
			cropThreshold: 600,
			dataGrouping: {
				enabled: false
			},
			data: (function () {
			    // generate an array of random data
			    var data = [],
				time = (new Date()).getTime(),
				i;

			    for (i = -19; i <= 0; i += 1) {
				data.push({
				    x: time + i * 1000,
				    y: 0 
				});
			    }
			    return data;
			}()),
			marker: {
				enabled: false
			}
		    }]
		});

/*
		var series = this.series[0];
                var websocket = new WebSocket('ws://192.168.1.5:3080/live');
                websocket.onmessage = function (e) {
                	var x = (new Date()).getTime();
                	var y = e.data || 0;
                        series.addPoint([x, y], true, true);
                }
*/

		window.chart = chart; // expose for testing
	}
})();
