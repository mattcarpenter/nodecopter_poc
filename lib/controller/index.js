var config = require('../config');
var constants = require('../constants');
var pru = require('node-pru-extended');
var ranges = config.controller.ranges;

module.exports = {
	initialize: initialize,
	read: read
};

/**
 * Initializes the PRU, loads the PPM decoder program, and executes it
 */
function initialize() {
	// first, initialize channel data array
	config.controller.channels.forEach(function (channel) {
		rawChannelValues[channel.func.key] = 0;
	});

	// init pru and load program
	pru.init();
	pru.loadDatafile(config.controller.pru.dataFile);
	pru.execute(config.controller.pru.textFile, config.controller.pru.startAddress);
}

/**
 * Returns channel values (in microseconds) from the PRU shared memory
 *
 * @param {boolean} raw set true to return raw PWM readings
 *
 * @example
 * controller.read()
 * // { ROLL: 0, PITCH: 0, YAW: 0, THROTTLE: 0 }
 */
function read(raw) {
	var rawChannelValues = {};

	for (var i = 0; i < config.controller.channels.length; i++) {
		rawChannelValues[config.controller.channels[i].func.key] = pru.getSharedRAMInt(i);
	}

	if (raw) {
		return rawChannelValues;
	}

	rawChannelValues.roll = map(rawChannelValues.roll, ranges.roll.min, ranges.roll.max, -45, 45);
	rawChannelValues.pitch = map(rawChannelValues.pitch, ranges.pitch.min, ranges.pitch.max, -45, 45);
	rawChannelValues.yaw = map(rawChannelValues.yaw, ranges.yaw.min, ranges.yaw.max, -180, 180);

	return rawChannelValues;
}

/**
 * Maps a value into a range
 */
function map(input, inputMin, inputMax, rangeMin, rangeMax) {
	var absInput = (input - inputMin) / (minputMax - inputMin);
	return ((Math.abs(rangeMin) + Math.abs(rangeMax)) * absInput) + rangeMin;
}