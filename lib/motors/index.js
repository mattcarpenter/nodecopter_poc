var constants = require('../constants');
var config = require('../config');

var armed = false;
var rawMotorValues = {};

var __tick = 0;

module.exports = {
	initialize: initialize,
	setMotor: setMotor,
	setArmedStatus: setArmedStatus,
	update: update
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
 * @param {number} value (0-1)
 */
function setMotor(motor, value) {
	var motorConf;
	
	config.motors.some(function (m) {
		return (m.position === motor ? (motorConf = m) : false);
	});
	 
	var rawValue = (value * (motorConf.outputRange[1] - motorConf.outputRange[0])) + motorConf.outputRange[0]
	rawMotorValues[motor.key] = armed ? rawValue : 0;
}

/**
 * Updates motor output PWM duty cycles
 */
function update() {
	config.motors.forEach(function (motor) {
		// update motor.gpio with value from rawMotorValues[motor.key]
		__tick++;
		if (__tick === 200) {
			__tick = 0;
			console.log(rawMotorValues);
		}
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
