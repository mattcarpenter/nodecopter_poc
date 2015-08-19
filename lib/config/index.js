var constants = require('../constants');

module.exports = {

	motors: [	
		{
			position: constants.MOTOR_POSITION.FRONT_LEFT,
			gpio: 6, // p8.27 
			outputRange: [1000, 2000]
		},
		{
			position: constants.MOTOR_POSITION.FRONT_RIGHT,
			gpio: 7, // p8.28 
			outputRange: [1000, 2000]
		},
		{
			position: constants.MOTOR_POSITION.REAR_LEFT,
			gpio: 8, // p8.29
			outputRange: [1000, 2000]
		},
		{
			position: constants.MOTOR_POSITION.REAR_RIGHT,
			gpio: 9, // p8.30 
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
		],

		ranges: {
			roll: {
				min: 1069,
				max: 1918
			},
			pitch: {
				min: 1064,
				max: 1921
			},
			yaw: {
				min: 1092,
				max: 1933 
			},
			throttle: {
				min: 1120,
				max: 1921
			}
		}
	},

	pids: {
		rate: {
			pitch: {
				p: 0.85,
				i: 0,
				d: 0.004,
				iMax: 50 
			},
			roll: {
				p: 0.3,
				i: 0,
				d: 0.004, 
				iMax: 50 
			},
			yaw: {
				p: 0.7,
				i: 0,
				d: 0.004,
				iMax: 50
			}
		},
		stab: {
			pitch: {
				p: 4.7
			},
			roll: {
				p:  3
			},
			yaw: {
				p: 3 
			}
		}
	}
};
