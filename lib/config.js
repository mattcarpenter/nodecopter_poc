var constants = require('./constants');

module.exports = {

	motors: [
		{
			position: constants.MOTOR_POSITION.FRONT_LEFT,
			gpio: 'P9.10',
			outputRange: [1000, 2000]
		},
		{
			position: constants.MOTOR_POSITION.FRONT_RIGHT,
			gpio: 'P9.10',
			outputRange: [1000, 2000]
		},
		{
			position: constants.MOTOR_POSITION.REAR_LEFT,
			gpio: 'P9.10',
			outputRange: [1000, 2000]
		},
		{
			position: constants.MOTOR_POSITION.REAR_RIGHT,
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
	},

	pids: {
		rate: {
			pitch: {
				p: 0.7,
				i: 1
			},
			roll: {
				p: 0.7,
				i: 1
			},
			yaw: {
				p: 2.5,
				i: 1
			}
		},
		stab: {
			pitch: {
				p: 4.5
			},
			roll: {
				p: 4.5
			},
			yaw: {
				p: 10
			}
		}
	}
};
