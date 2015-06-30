var Enum = require('enum');

var constants = {
	MOTOR_POSITION: new Enum(['FRONT_LEFT', 'FRONT_RIGHT', 'REAR_LEFT', 'REAR_RIGHT']),
	CHANNEL: new Enum(['ROLL', 'PITCH', 'YAW', 'THROTTLE'])
};

module.exports = constants;
