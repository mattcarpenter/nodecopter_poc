var mpu6050 = require('mpu6050');
var controller = require('lib/controller');

// init MPU
var mpu = new mpu6050();
mpu.initialize();
controller.initialize();

// output loop
setInterval(function() {

	// read MPU
	console.log(mpu.getMotion6());

	// read PRU
	console.log(controller.read());

}, 500);

//mpu.setSleepEnabled(1);
