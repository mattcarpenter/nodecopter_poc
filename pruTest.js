var pru = require('prussdrv');
var 
pru.init();

pru.loadDatafile('data.bin');
pru.execute('text.bin', 908);

pru.waitForInterrupt(function(){
console.log("Interrupted by PRU");