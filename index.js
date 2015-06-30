var mpu6050 = require('mpu6050');
var controller = require('./lib/controller');
var motors = require('./lib/motors');
var constants = require('./lib/constants');

// init MPU
var mpu = new mpu6050();
mpu.initialize();
controller.initialize();

// init motors
motors.initialize();
motors.setArmedStatus(true);
motors.setMotor(constants.MOTOR_POSITION.FRONT_LEFT, 1);

// output loop
setInterval(function() {

	// read MPU
	//console.log(mpu.getMotion6());

	// read PRU
	//console.log(controller.read());

	motors.update();

}, 1);

//mpu.setSleepEnabled(1);
