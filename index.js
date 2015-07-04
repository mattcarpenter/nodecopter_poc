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
		if (rc.THROTTLE < config.controller.ranges.throttle.min + 100) {
			motors.zeroMotors();
		} else {

			// update rate PIDs and obtain the correction offset
			correction = ratePids.update(rc);

			// update the motors
			motors.setMotor(constants.MOTOR_POSITION.FRONT_LEFT, rc.THROTTLE - correction.roll - correction.pitch);
			motors.setMotor(constants.MOTOR_POSITION.REAR_LEFT, rc.THROTTLE - correction.roll + correction.pitch);
			motors.setMotor(constants.MOTOR_POSITION.FRONT_RIGHT, rc.THROTTLE + correction.roll - correction.pitch);
			motors.setMotor(constants.MOTOR_POSITION.REAR_RIGHT, rc.THROTTLE + correction.roll + correction.pitch);
		}

		motors.update();
	}, 1);
})();
//mpu.setSleepEnabled(1);
