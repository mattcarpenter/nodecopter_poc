var motion = require('../../motion');
var Pid = require('../common/');
var config = require('../../config');
var pidConfig = config.pids.stab;
var fs = require('fs');
var pids = {};
var server = require('../../server');
var yawTarget = 0;

module.exports = {
        initialize: initialize,
        update: update,
	setYawTarget: setYawTarget
};

function setYawTarget(yaw) {
	yawTarget = yaw;
}

function initialize() {
        pids['roll'] = Pid(pidConfig.roll.p, pidConfig.roll.i, pidConfig.roll.d, 50);
        pids['pitch'] = Pid(pidConfig.pitch.p, pidConfig.pitch.i, pidConfig.pitch.d, 50);
        pids['yaw'] = Pid(pidConfig.yaw.p, pidConfig.yaw.i, pidConfig.yaw.d, 50);
}

function wrap180(x) {
 return (x < -180 ? x + 360 : (x > 180 ? x - 360 : x));
}

function update(target) {
	var attitude = motion.getAttitude();
	var rotation = motion.getRotation();
        var correction = {};

	correction.roll = pids['roll'].getPid(target.ROLL - attitude.roll, 1);
	correction.pitch = pids['pitch'].getPid(target.PITCH - attitude.pitch, 1);
	correction.yaw = pids['pitch'].getPid(wrap180(yawTarget - attitude.yaw), 1);

	try {
		server.send(attitude.roll + ',' + rotation.roll+ ',' + correction.roll);
	} catch (e) {}

	// is pilot asking for yaw change?	
	if (Math.abs(target.YAW) > 5) {
		correction.yaw = target.YAW / 4;
	} else {
		correction.yaw = 0;
	}
	return correction;
}
	
