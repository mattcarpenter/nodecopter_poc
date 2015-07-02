var gulp = require('gulp');
var motion = require('../../lib/motion');

gulp.task('calibrate', function (cb) {
	motion.initialize();
	motion.calibrate().then(function () {
		console.log('calibration completed');
		cb();
	});	
});
