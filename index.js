var controller = require('./lib/controller');
var config = require('./lib/config');
var motors = require('./lib/motors');
var motion = require('./lib/motion');
var constants = require('./lib/constants');
var ratePids = require('./lib/pid/rate');
var stabPids = require('./lib/pid/stab');
var pru = require('node-pru-extended');
var SegfaultHandler = require('segfault-handler');
var server = require('./lib/server');

SegfaultHandler.registerHandler();

// initialize the PRUSS
pru.init();

// initialize webserver
server.init();

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
	var attitude;

	setInterval(function() {
		rc = controller.read();
		attitude = motion.getAttitude();

		// pretend there is no input
		//rc.YAW = 0;
		//rc.ROLL = 0;
		//rc.PITCH = 0;

		// stabilization requires some footroom to work properly
		if (rc.THROTTLE < config.controller.ranges.throttle.min + 100) {
			motors.zeroMotors();
			// remember yaw
			stabPids.setYawTarget(attitude.yaw);
		} else {
			// update stab PIDs
			stabCorrection = stabPids.update(rc);
			//console.log('yaw: ' + attitude.yaw + ' corr: ' + stabCorrection.yaw);	
			// basically convert the keys to lowercase because I
			// suck at naming things with consistency.
			ratePidTarget.ROLL = stabCorrection.roll;
			ratePidTarget.PITCH = stabCorrection.pitch;
			ratePidTarget.YAW = stabCorrection.yaw; 
			
			// update rate PIDs and obtain the correction offset
			correction = ratePids.update(ratePidTarget);
			//console.log(correction.yaw);
			// update the motors
//correction.roll = 0;
correction.yaw = 0;
			motors.setMotor(constants.MOTOR_POSITION.FRONT_LEFT, rc.THROTTLE + correction.roll - correction.pitch - correction.yaw);
			motors.setMotor(constants.MOTOR_POSITION.REAR_LEFT, rc.THROTTLE + correction.roll + correction.pitch + correction.yaw);
			motors.setMotor(constants.MOTOR_POSITION.FRONT_RIGHT, rc.THROTTLE - correction.roll - correction.pitch + correction.yaw);
			motors.setMotor(constants.MOTOR_POSITION.REAR_RIGHT, rc.THROTTLE - correction.roll + correction.pitch - correction.yaw);
		}

		motors.update();
	}, 5); // should be 5ms
})();
//mpu.setSleepEnabled(1);
