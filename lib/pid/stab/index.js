var motion = require('../../motion');
var Pid = require('../common/');
var config = require('../../config');
var pidConfig = config.pids.stab;
var fs = require('fs');
var pids = {};
var server = require('../../server');

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
	var attitude = motion.getAttitude();
	var rotation = motion.getRotation();
        var correction = {};

	//fs.appendFileSync('log.txt', acceleration.y + "\n");
	// todo: if target.yaw > (5?) then pass through without PID controller
	// (pilot requesting yaw change)

	correction.roll = pids['roll'].getPid(target.ROLL - attitude.roll, 1);
	//correction.pitch = pids['pitch'].getPid(attitude.pitch - target.PITCH, 1);	
	correction.pitch = pids['pitch'].getPid(target.PITCH - attitude.pitch, 1);
	correction.yaw = pids['pitch'].getPid(attitude.yaw - target.YAW, 1);

	try {
		server.send(attitude.roll + ',' + rotation.roll+ ',' + correction.roll);
	} catch (e) {}
	
	correction.yaw = 0; // don't yaw nothin

	return correction;
}
	
