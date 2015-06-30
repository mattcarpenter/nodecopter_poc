var constants = require('./constants');

module.exports = {

	motors: [
		{
			position: constants.MOTOR_POSITION.MOTOR_FRONT_LEFT,
			gpio: 'P9.10',
			outputRange: [1000, 2000]
		},
		{
			position: constants.MOTOR_POSITION.MOTOR_FRONT_RIGHT,
			gpio: 'P9.10',
			outputRange: [1000, 2000]
		},
		{
			position: constants.MOTOR_POSITION.MOTOR_REAR_LEFT,
			gpio: 'P9.10',
			outputRange: [1000, 2000]
		},
		{
			position: constants.MOTOR_POSITION.MOTOR_REAR_RIGHT,
			gpio: 'P9.10',
			outputRange: [1000, 2000]
		}
	],

	controller: {

		// ppm signal decoder runs on PRU0
		pru: {
			startAddress: 668,
			textFile: 'text.bin',
			dataFile: 'data.bin'
		},

		// note: order of channels array must match channel order from rx
		channels: [
			{
				func: constants.CHANNEL.ROLL
			},
			{
				func: constants.CHANNEL.THROTTLE
			},
			{
				func: constants.CHANNEL.PITCH
			},
			{
				func: constants.CHANNEL.YAW
			}
		]
	}
};
