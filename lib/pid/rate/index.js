var motion = require('../../motion');
var Pid = require('../common/');
var config = require('../../config');
var pidConfig = config.pids.rate;

var pids = {};

module.exports = {
	initialize: initialize,
	update: update
};

function initialize() {
	pids['roll'] = Pid(pidConfig.roll.p, pidConfig.roll.i, pidConfig.roll.d, 50);
	pids['pitch'] = Pid(pidConfig.pitch.p, pidConfig.pitch.i, pidConfig.pitch.d, 50);
	pids['yaw'] = Pid(pidConfig.yaw.p, pidConfig.yaw.i, pidConfig.yaw.d, 50);
	
}

function update(target) {
	var rotation = motion.getRotation();
	var correction = {};

	var rollError = target.ROLL - rotation.y;
	var pitchError = target.PITCH - rotation.x;
	var yawError = target.YAW - rotation.z;
	
	correction.roll = pids['roll'].getPid(rollError, 1);
	correction.pitch = pids['pitch'].getPid(pitchError, 1, true);
	correction.yaw = pids['yaw'].getPid(yawError, 1);

	return correction;
}
