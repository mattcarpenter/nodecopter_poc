var controller = require('./lib/controller');
var motors = require('./lib/motors');
var motion = require('./lib/motion');
var constants = require('./lib/constants');
var ratePID = require('./lib/pid/rate');

// initialize r/c controller
controller.initialize();

// initialize and arm the motors
motors.initialize();
motors.setArmedStatus(true);
//motors.setMotor(constants.MOTOR_POSITION.FRONT_LEFT, 1);

// initialize accelerometer and gyro
motion.initialize();

// flight control loop
/*
setInterval(function() {

	console.log(motion.getRotation());
	motors.update();
}, 100);
*/
//mpu.setSleepEnabled(1);
