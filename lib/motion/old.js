/**
 * This motion module is a simple wrapper for the mpu6050 IMU.
 * Other IMU's may be used as long as their node modules retain
 * the same interface as this module.
 */

var mpu6050 = require('mpu6050');
var q = require('q');
var offsets = require('../config/offsets.json');
var mpu;
var finalXrot = 0;
var finalYrot = 0;
var finalX = 0;
var finalY = 0;
var lastTime = 0;
var rotXValues = [];
var rotYValues = [];
var median = require('filters').median;
var average = require('filters').average;
/**
 * @const
 * number of samples to average
 */
var MEAN_BUFFER_SIZE = 200;

/**
 * @const
 * radians per degree
 */
var RADIANS_PER_DEGREE = 57.2957795;

var ACCEL_DEADZONE = 8;
var GYRO_DEADZONE = 1;

/**
 * @const
 * number of samples to discard when averaging the resting state values
 */
var MEAN_DISCARDED_SAMPLES = 100;

/**
 * @const
 * low pass filter alpha
 */
var ALPHA = 0.5;

var fXg = 0;
var fYg = 0;
var fZg = 0;

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
	getRotation: getRotation,
	calibrate: calibrate
};

/**
 * Initializes the motion module
 */
function initialize() {
	mpu = new mpu6050();
	mpu.initialize();
	mpu.setDMPEnabled(true);
	mpu.setDLPF();
}

function calibrate() {
	var deferred = q.defer();

	meanSensors().then(function (initialMean) {
		offset.ax = -initialMean.ax * 0.9;
		offset.ay = -initialMean.ay * 0.9;
		offset.az = (16384-initialMean.az) * 0.9;
		offset.gx = initialMean.gx * 0.9;
		offset.gy = initialMean.gy * 0.9;
		offset.gz = initialMean.gz * 0.9;
		
		// wait 1000ms then begin tuning
		setTimeout(function () {
			tune();
		}, 1000);	
	});

	function tune() {
		meanSensors().then(function (mean) {
			var ready = 0;
			var rawGz = mean.gz;
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
			
			if (Math.abs(mean.ay) <= ACCEL_DEADZONE) {
				ready++;
			} else {
				offset.ay = offset.ay - mean.ay / ACCEL_DEADZONE * 0.2;
			}

			if (Math.abs(16384 - mean.az) <= ACCEL_DEADZONE) {
				ready++;
			} else {
				offset.az = offset.az + ((16384 - mean.az) / ACCEL_DEADZONE * 0.5);
			}

			if (Math.abs(mean.gx) <= GYRO_DEADZONE) {
				ready++;
			} else {
				offset.gx = offset.gx - mean.gx / ((GYRO_DEADZONE * 0.5) + 1);
			}

			if (Math.abs(mean.gy) <= GYRO_DEADZONE) {
				ready++;
			} else {
				offset.gy = offset.gy - mean.gy / ((GYRO_DEADZONE * 0.5) + 1);
			}

			if (Math.abs(mean.gz) <= GYRO_DEADZONE) {
				ready++;
			} else {
				offset.gz = offset.gz - mean.gz / ((GYRO_DEADZONE * 0.5) + 1);
			}
			
			if (ready === 6) {
				deferred.resolve(offset);
			} else {
				setTimeout(function () {
					tune();
				}, 1);
			}
			console.log('ready: ' + ready + '/' + 6);
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
	var rotation = getRotation();
	var currentTime = (new Date()).getTime();
	var ay = acc[0] + offsets.ay;
	var ax = acc[1] + offsets.ax;
	var az = acc[2] + offsets.az;
	var dt;

	if (!lastTime) {
		dt = 0;
	} else {
		dt = (currentTime - lastTime) / 1000;
	}

	if (dt > 1) {
		dt = 0;

		fXg = 0;
		fYg = 0;
		fZg = 0;

		finalX = 0;
		finalY = 0;
		finalXrot = 0;
		finalYrot = 0;
	}
	
	lastTime = currentTime;
	
	//fXg = ax;
	//fYg = ay;
	//fZg = az; 

	// apply low pass filter to ACC readings
	fXg = 0.83 * fXg + 0.17 * ax;
	fYg = 0.83 * fYg + 0.17 * ay;
	fZg = 0.83 * fZg + 0.17 * az;	

	var angles = {
		x: (180 / 3.141952) * Math.atan(fXg / Math.sqrt(Math.pow(fYg, 2) + Math.pow(fZg, 2))),
		y: (180 / 3.141952) * Math.atan(fYg / Math.sqrt(Math.pow(fXg, 2) + Math.pow(fZg, 2))),
		z: (180 / 3.141952) * Math.atan(fZg / Math.sqrt(Math.pow(fXg, 2) + Math.pow(fYg, 2)))
	};

	finalX += rotation.x * dt;
	finalY -= rotation.y * dt;
	
	finalX = 0.97 * finalX + 0.03 * angles.x;
	finalY = 0.97 * finalY + 0.03 * angles.y;	

	return {
		/*
		x: (0.85 * angles.x) + ((0.15) * rotation.x),
		y: (0.85 * angles.y) + ((0.15) * rotation.y),
		z: (0.85 * angles.z) + ((0.15) * rotation.z),
		*/
		x: finalX,
		y: finalY,
		z: angles.z, 
		rx: angles.x,
		ry: angles.y,
		rz: angles.z
	};
	/*return {
		y: (180 / 3.141592) * Math.atan(ay / Math.sqrt(Math.pow(ax, 2) + Math.pow(az, 2))),
		x: (180 / 3.141592) * Math.atan(ax / Math.sqrt(Math.pow(ay, 2) + Math.pow(az, 2))),
		z: (180 / 3.141592) * Math.atan(az / Math.sqrt(Math.pow(ax, 2) + Math.pow(ay, 2)))
	};*/
}

/**
 * Returns the rate of rotation along the three axis
 *
 * @return {Object} rotation
 * @return {number} rotation.x
 * @return {number} rotation.y
 * @return {number} rotation.z
 */

var rotationX = 0;
var rotationY = 0;
var rotationZ = 0;

function getRotation() {
	var motion = mpu.getMotion6();

	var rawX = (motion[3] + offsets.gx) / 131;
	var rawY = (motion[4] + offsets.gy) / 131;
	var rawZ = (motion[5] + offsets.gz) / 131;

	rotXValues.push(rawX);
	rotYValues.push(rawY);

	var samples = 5;

	if (rotXValues.length > samples) rotXValues.shift();
	if (rotYValues.length > samples) rotYValues.shift();

	var medianX = median(rotXValues);
	var medianY = median(rotYValues);
	
	var weight = 0.2;	

	// low pass filter
	rotationX = rotationX * (1 - weight) + rawX * weight;
	rotationY = rotationY * (1 - weight) + rawY * weight;
	rotationZ = rotationZ * (1 - weight) + rawZ * weight;
	return {
		x: rotationX,
		y: rotationY,
		z: rotationZ
	}; 
}

function meanSensors() {
	var deferred = q.defer();
	var mean = motion6();
	var i = 0;
	var buffer = motion6();
	var samplesRecorded = MEAN_BUFFER_SIZE - MEAN_DISCARDED_SAMPLES; 
	var actual = 0;
	read();

	return deferred.promise;

	function read() {
		var sample = mpu.getMotion6();
		
		// discard first 100 samples
		if (i > MEAN_DISCARDED_SAMPLES) {
			buffer.ax = buffer.ax + sample[1];
			buffer.ay = buffer.ay + sample[0];
			buffer.az = buffer.az + sample[2];
			buffer.gx = buffer.gx + sample[3];
			buffer.gy = buffer.gy + sample[4];
			buffer.gz = buffer.gz + sample[5];
			actual++;
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
