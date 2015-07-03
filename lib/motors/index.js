var constants = require('../constants');
var config = require('../config');

var armed = false;
var rawMotorValues = {};

var __tick = 0;

module.exports = {
	initialize: initialize,
	setMotor: setMotor,
	setArmedStatus: setArmedStatus,
	update: update,
	zeroMotors: zeroMotors
};

/**
 * Initializes the motors module
 */
function initialize() {
	zeroMotors();
}

/**
 * Sets a motor output value
 *
 * @param {Enum} motor
 * @param {number} value PWM value
 */
function setMotor(motor, value) {
	var motorConf;
	
	/**
	 * TODO: This is quite inefficient. We should build a motor configuration map
	 *		 at initialization, or maybe even change the configuration schema.
	 */
	config.motors.some(function (m) {
		return (m.position === motor ? (motorConf = m) : false);
	});

	rawMotorValues[motor.key] = armed ? value : 0;
}

/**
 * Updates motor output PWM duty cycles
 */
function update() {
	config.motors.forEach(function (motor) {
		// update motor.gpio with value from rawMotorValues[motor.key]
		console.log(rawMotorValues);
	});
}

/**
 * Arms or disarms the motors
 *
 * @param {boolean} armed
 */
function setArmedStatus(armedStatus) {
	armed = armedStatus;

	if (!armed) {
		zeroMotors();
	}

	// Force update
	update();
}

/**
 * Zeros out the raw motor values
 */
function zeroMotors() {
	config.motors.forEach(function (motor) {
		rawMotorValues[motor.position.key] = 0;
	});
} 
