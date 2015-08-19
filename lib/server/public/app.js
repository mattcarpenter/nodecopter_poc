(function () {

	var dps = []; // dataPoints (acc)
	var dps2 = []; // dataPoints2 (rotation)
	var dps3 = []; // dataPoints3 (raw acc)
	var chart = new CanvasJS.Chart("chart",{
		title :{
			text: "Acceleration and Rotation"
		},			
		data: [{
			type: "line",
			dataPoints: dps,
			legendText: "acc",
			showInLegend: true 
		}, {
			type: "line",
			dataPoints: dps2,
			legendText: "rotation",
			showInLegend: true
		}, {
			type: "line",
			dataPoints: dps3,
			legendText: "correction",
			showInLegend: true
		}],
		axisY: {
			minimum: -45,
			maximum: 45
		},
	});

	var xVal = 0;
	var yVal = 100;	
	var updateInterval = 20;
	var dataLength = 120; // number of dataPoints visible at any point

	var updateChart = function (count) {
		if (dps.length > dataLength) {
			dps.shift();				
			dps2.shift();
			dps3.shift();
		}
		
		chart.render();		
	};

	// generates first set of dataPoints
	updateChart(dataLength); 

	// update chart after specified time. 
	setInterval(function(){updateChart()}, updateInterval); 

	var ws = new WebSocket('ws://192.168.1.10:3080/live');

	ws.onmessage = function (event) {
		var points = event.data.split(',');
		dps.push({x: xVal, y: parseFloat(points[0])});
		dps2.push({x: xVal, y: parseFloat(points[1])});
		dps3.push({x: xVal, y: parseFloat(points[2])});
		xVal++;
	};	

})();
