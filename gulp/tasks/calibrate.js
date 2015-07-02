var gulp = require('gulp');
var motion = require('../../lib/motion');
var fs = require('fs');

gulp.task('calibrate', function (cb) {
	motion.initialize();
	motion.calibrate().then(function (offsets) {
		console.log('calibration completed with offsets:');
		console.log(offsets);

		// write offsets to configuration file
		var fileName = './lib/config/offsets.json';
		fs.writeFile(fileName, JSON.stringify(offsets, null, 4), cb);	
	});	
});
