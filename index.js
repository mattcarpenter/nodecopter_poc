var mpu6050 = require('mpu6050');
var pru = require('node-pru-extended');

var mpu = new mpu6050();
mpu.initialize();
if (mpu.testConnection()) {
setInterval(function() {
	console.log(mpu.getMotion6());
}, 500);
}
//mpu.setSleepEnabled(1);
