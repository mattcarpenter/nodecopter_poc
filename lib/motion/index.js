/**
 * This motion module is a simple wrapper for the mpu6050 IMU.
 * Other IMU's may be used as long as their node modules retain
 * the same interface as this module.
 */

var mpu6050 = require('mpu6050');
var mpu;

module.exports = {
	initialize: initialize,
	getAcceleration: getAcceleration,
	getRotation: getRotation
};

/**
 * Initializes the motion module
 */
function initialize() {
	mpu = new mpu6050();
	mpu.initialize();
}

/**
 * Returns the three acceleration values
 *
 * @return {Object} acceleration
 * @return {number} acceleration.x
 * @return {number} acceleration.y
 * @return {number} acceleration.z
 */
function getAcceleration() {
	var acc = mpu.getAcceleration();
	return {
		x: acc[0],
		y: acc[1],
		z: acc[2]
	};
}

/**
 * Returns the rate of rotation along the three axis
 *
 * @return {Object} rotation
 * @return {number} rotation.x
 * @return {number} rotation.y
 * @return {number} rotation.z
 */
function getRotation() {
	var rotation = mpu.getRotation();
	return {
		x: rotation[0],
		y: rotation[1],
		z: rotation[2]
	};
}
