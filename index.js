var mpu6050 = require('mpu6050');
var pru = require('node-pru-extended');

// init MPU
var mpu = new mpu6050();
mpu.initialize();

// init PRU
pru.init();
pru.loadDatafile('data.bin');
pru.execute('text.bin', 908);

// output loop
setInterval(function() {

	// read MPU
	console.log(mpu.getMotion6());

	// read PRU
	console.log(pru.getSharedRAMInt(0));

}, 500);

//mpu.setSleepEnabled(1);
