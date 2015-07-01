/**
 * This motion module is a simple wrapper for the mpu6050 IMU.
 * Other IMU's may be used as long as their node modules retain
 * the same interface as this module.
 */

var mpu6050 = require('mpu6050');
var q = require('q');
var mpu;

/**
 * @const
 * number of samples to average
 */
var MEAN_BUFFER_SIZE = 200;

var ACCEL_DEADZONE = 8;
var GYRO_DEADZONE = 1;

/**
 * @const
 * number of samples to discard when averaging the resting state values
 */
var MEAN_DISCARDED_SAMPLES = 100;

var motion6 = function () {
	return {
		ax: 0,
		ay: 0,
		az: 0,
		gx: 0,
		gy: 0,
		gz: 0
	};
};

var offset = motion6();

module.exports = {
	initialize: initialize,
	getAcceleration: getAcceleration,
	getRotation: getRotation
};

/**
 * Initializes the motion module
 */
function initialize() {
	var deferred = q.defer();
	mpu = new mpu6050();
	mpu.initialize();

	calibrate().then(function () {
		console.log('Calibration complete');
		console.log('Offsets:');
		console.log(offset);
		deferred.resolve();
	});

	return deferred.promise;
}

function calibrate() {
	var deferred = q.defer();

	meanSensors().then(function (initialMean) {
		offset.ax = -initialMean.ax / 8;
		offset.ay = -initialMean.ay / 8;
		offset.az = (16384-initialMean.az) / 8;
		offset.gx = initialMean.gx / 4;
		offset.gy = initialMean.gy / 4;
		offset.gz = initialMean.gz / 4;
		
		// wait 1000ms then begin tuning
		setTimeout(function () {
			tune();
		}, 1000);	
	});

	function tune() {
		console.log('...');
		meanSensors().then(function (mean) {
			var ready = 0;

			mean.ax += offset.ax;
			mean.ay += offset.ay;
			mean.az += offset.az;
			mean.gx += offset.gx;
			mean.gy += offset.gy;
			mean.gz += offset.gz;

			if (Math.abs(mean.ax) <= ACCEL_DEADZONE) {
				ready++;
			} else {
				offset.ax = offset.ax - mean.ax / ACCEL_DEADZONE;
			}
			console.log('ax mean: ' + Math.abs(mean.ax));
			console.log('deadzone: ' + ACCEL_DEADZONE);
			console.log('ax offset: ' + offset.ax);
			if (Math.abs(mean.ay) <= ACCEL_DEADZONE) {
				ready++;
			} else {
				offset.ay = offset.ay - mean.ay / ACCEL_DEADZONE;
			}

			if (Math.abs(16384 - mean.az) <= ACCEL_DEADZONE) {
				ready++;
			} else {
				offset.az = offset.ax + (16384 - mean.az) / ACCEL_DEADZONE;
			}

			if (Math.abs(mean.gx) <= GYRO_DEADZONE) {
				ready++;
			} else {
				offset.gx = offset.gx - mean.gx / (GYRO_DEADZONE + 1);
			}

			if (Math.abs(mean.gy) <= GYRO_DEADZONE) {
				ready++;
			} else {
				offset.gy = offset.gy - mean.gy / (GYRO_DEADZONE + 1);
			}

			if (Math.abs(mean.gz) <= GYRO_DEADZONE) {
				ready++;
			} else {
				offset.gz = offset.gz - mean.gz / (GYRO_DEADZONE + 1);
			}

			if (ready === 6) {
				deferred.resolve();
			} else {
				setTimeout(function () {
					tune();
				}, 1);
			}
		});
	}

	return deferred.promise;
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

function meanSensors() {
	var deferred = q.defer();
	var mean = motion6();
	var i = 0;
	var buffer = motion6();
	var samplesRecorded = MEAN_BUFFER_SIZE ; MEAN_DISCARDED_SAMPLES;

	read();

	return deferred.promise;

	function read() {
		var sample = mpu.getMotion6();

		// discard first 100 samples
		if (i >= MEAN_DISCARDED_SAMPLES) {
			buffer.ax = buffer.ax + sample[0];
			buffer.ay = buffer.ay + sample[1];
			buffer.az = buffer.az + sample[2];
			buffer.gx = buffer.gx + sample[3];
			buffer.gy = buffer.gy + sample[4];
			buffer.gz = buffer.gz + sample[5];
		}

		if (i < MEAN_BUFFER_SIZE) {
			setTimeout(read, 0);
		} else {
			// finished
			mean.ax = buffer.ax / samplesRecorded;
			mean.ay = buffer.ay / samplesRecorded;
			mean.az = buffer.az / samplesRecorded;
			mean.gx = buffer.gx / samplesRecorded;
			mean.gy = buffer.gy / samplesRecorded;
			mean.gz = buffer.gz / samplesRecorded;

			deferred.resolve(mean);
		}
		i++;
	}
}
