var config = require('../config');
var constants = require('../constants');
var pru = require('node-pru-extended');

var rawChannelValues = {};

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
 * @example
 * controller.read()
 * // { ROLL: 0, PITCH: 0, YAW: 0, THROTTLE: 0 }
 */
function read() {
	for (var i = 0; i < config.controller.channels.length; i++) {
		rawChannelValues[config.controller.channels[i].func.key] = pru.getSharedRAMInt(i);
	}

	return rawChannelValues;
}
