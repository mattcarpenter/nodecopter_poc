var controller = require('./lib/controller');
var config = require('./lib/config');
var motors = require('./lib/motors');
var motion = require('./lib/motion');
var constants = require('./lib/constants');
var ratePids = require('./lib/pid/rate');
var stabPids = require('./lib/pid/stab');
var pru = require('node-pru-extended');

// initialize the PRUSS
pru.init();

// initialize r/c controller
controller.initialize();

// initialize and arm the motors
motors.initialize();
motors.setArmedStatus(true);
//motors.setMotor(constants.MOTOR_POSITION.FRONT_LEFT, 1);

// initialize accelerometer and gyro
motion.initialize();

// initialize the pids
ratePids.initialize();
stabPids.initialize();

// flight control loop
(function () {
	var rc;
	var stabCorrection;
	var correction;
	var ratePidTarget = {};

	setInterval(function() {
		rc = controller.read();
		
		// pretend there is no input
		//rc.YAW = 0;
		//rc.ROLL = 0;
		//rc.PITCH = 0;

		// stabilization requires some footroom to work properly
		if (rc.THROTTLE < config.controller.ranges.throttle.min + 100) {
			motors.zeroMotors();
		} else {
			// update stab PIDs
			stabCorrection = stabPids.update(rc);
			
			// basically convert the keys to lowercase because I
			// suck at naming things with consistency.
			ratePidTarget.ROLL = stabCorrection.roll;
			ratePidTarget.PITCH = stabCorrection.pitch;
			ratePidTarget.YAW = stabCorrection.yaw; 
	
			// update rate PIDs and obtain the correction offset
			correction = ratePids.update(ratePidTarget);
			//console.log(correction.roll);
			
			// update the motors
			motors.setMotor(constants.MOTOR_POSITION.FRONT_LEFT, rc.THROTTLE - correction.roll + correction.pitch);
			motors.setMotor(constants.MOTOR_POSITION.REAR_LEFT, rc.THROTTLE - correction.roll - correction.pitch);
			motors.setMotor(constants.MOTOR_POSITION.FRONT_RIGHT, rc.THROTTLE + correction.roll + correction.pitch);
			motors.setMotor(constants.MOTOR_POSITION.REAR_RIGHT, rc.THROTTLE + correction.roll - correction.pitch);
		}

		motors.update();
	}, 5);
})();
//mpu.setSleepEnabled(1);
