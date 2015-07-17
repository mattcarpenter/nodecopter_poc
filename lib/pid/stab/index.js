var motion = require('../../motion');
var Pid = require('../common/');
var config = require('../../config');
var pidConfig = config.pids.stab;

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
        var acceleration = motion.getAcceleration();
        var correction = {};

	// todo: if target.yaw > (5?) then pass through without PID controller
	// (pilot requesting yaw change)

	correction.roll = pids['roll'].getPid(target.ROLL - acceleration.y, 1);
	correction.pitch = pids['pitch'].getPid(target.PITCH - acceleration.x, 1);
	correction.yaw = pids['pitch'].getPid(target.YAW - acceleration.z, 1);

	return correction;
}
	
