var motion = require('../../motion');
var Controller = require('node-pid-controller');
var config = require('../../config');
var pidConfig = config.pids.rate;

var pids = {};

module.exports = {
	initialize: initialize,
	update: update
};

function initialize() {
	pids['roll'] = new Controller(pidConfig.roll.p, pidConfig.roll.i, pidConfig.roll.d);
	pids['pitch'] = new Controller(pidConfig.pitch.p, pidConfig.pitch.i, pidConfig.pitch.d);
	pids['yaw'] = new Controller(pidConfig.yaw.p, pidConfig.yaw.i, pidConfig.yaw.d);
}

function update(target) {
	var rotation = motion.getRotation();
	var correction = {};

	pids['roll'].setTarget(target.ROLL);
	pids['pitch'].setTarget(target.PITCH);
	pids['yaw'].setTarget(target.YAW);

	correction.roll = pids['roll'].update(rotation.y);
	correction.pitch = pids['pitch'].update(rotation.x);
	correction.yaw = pids['yaw'].update(rotation.z);

	return correction;
}
