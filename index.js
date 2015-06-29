(function() {
//var pru = require('prussdrv');
var mpu6050 = require('mpu6050');
var mpu = new mpu6050();
mpu.initialize();
if (mpu.testConnection()) {
setInterval(function() {
	console.log(mpu.getMotion6());
}, 500);
}
//mpu.setSleepEnabled(1);
return;
pru.init();

pru.loadDatafile('data.bin');
pru.execute('text.bin', 908);

pru.waitForInterrupt(function(){
console.log("Interrupted by PRU");
});
})();
