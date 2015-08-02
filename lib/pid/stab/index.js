var motion = require('../../motion');
var Pid = require('../common/');
var config = require('../../config');
var pidConfig = config.pids.stab;
var fs = require('fs');
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
//console.log(acceleration.y);	
fs.appendFileSync('log.txt', acceleration.y + "\n");
	// todo: if target.yaw > (5?) then pass through without PID controller
	// (pilot requesting yaw change)

	correction.roll = pids['roll'].getPid(acceleration.y - target.ROLL, 1);
	correction.pitch = pids['pitch'].getPid(acceleration.x - target.PITCH, 1);
	correction.yaw = pids['pitch'].getPid(acceleration.z - target.YAW, 1);
correction.yaw = 0; // don't yaw nothin
//console.log(correction.pitch);
	return correction;
}
	
