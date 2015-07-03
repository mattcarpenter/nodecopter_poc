var controller = require('./lib/controller');
var config = require('./lib/config');
var motors = require('./lib/motors');
var motion = require('./lib/motion');
var constants = require('./lib/constants');
var ratePids = require('./lib/pid/rate');

// initialize r/c controller
controller.initialize();

// initialize and arm the motors
motors.initialize();
motors.setArmedStatus(true);
//motors.setMotor(constants.MOTOR_POSITION.FRONT_LEFT, 1);

// initialize accelerometer and gyro
motion.initialize();

// initialize the rate pids
ratePids.initialize();

// flight control loop
(function () {
	var rc;
	var correction;

	setInterval(function() {
		rc = controller.read();

		// stabilization requires some footroom to work properly
		if (rc.throttle < config.controller.ranges.throttle.min + 100) {
			return motors.setArmedStatus(false);
		}

		correction = ratePids.update(rc);

		console.log(correction);

	}, 100);
})();
//mpu.setSleepEnabled(1);
