var controller = require('./lib/controller');
var config = require('./lib/config');
var motors = require('./lib/motors');
var motion = require('./lib/motion');
var constants = require('./lib/constants');
var ratePid = require('./lib/pid/rate');

// initialize r/c controller
controller.initialize();

// initialize and arm the motors
motors.initialize();
motors.setArmedStatus(true);
//motors.setMotor(constants.MOTOR_POSITION.FRONT_LEFT, 1);

// initialize accelerometer and gyro
motion.initialize();

// flight control loop
(function () {
	var rc;

	setInterval(function() {
		rc = controller.read();

		console.log(rc);

		// stabilization requires some footroom to work properly
		if (rc.throttle < config.controller.throttleMin + 100) {
			console.log('disarm');
			return motors.setArmedStatus(false);
		}



	}, 100);
})();
//mpu.setSleepEnabled(1);
