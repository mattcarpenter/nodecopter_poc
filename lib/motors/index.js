var constants = require('../constants');
var config = require('../config');
var b = require('octalbonescript');

var armed = false;
var rawMotorValues = {};

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
	rawMotorValues[motor.key] = armed ? value : 0;
}

/**
 * Updates motor output PWM duty cycles
 */
function update() {
	var out;

	config.motors.forEach(function (motor) {
		// update motor.gpio with value from rawMotorValues[motor.key]
		// todo: constrain motor output values to range in configuration
		out = ((rawMotorValues[motor.position.key] || 1000) - 1000) / 1000;
		out = (out < 0 ? 0 : (out > 1 ? 1 : out)); 
		b.analogWrite(motor.gpio, out, 500, function (er) {});
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
