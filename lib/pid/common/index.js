module.exports = function(kp, ki, kd, iMax) {	
	var lastTime;
	var lastDerivative = NaN;
	var lastError = 0;
	var integrator = 0;

	return {
		getPid: getPid,
		resetIntegrator: resetIntegrator
	};

	function getPid(error, scaler, debug) {
		var currentTime = ((new Date()).getTime()) / 1000; 
		var deltaTime = currentTime - lastTime;
		var output = 0;

		// Reset the integrator if this PID hasn't been used for a
		// full second to prevent I buildup and causing a massive
		// return before it corrects itself.
		if (lastTime === 0 || deltaTime > 1) {
			deltaTime = 0;
			resetIntegrator();
		}

		lastTime = currentTime;

		// compute proportional component
		output += error * kp;
	//if (debug) console.log(error);	
		// compute derivative component if time has elapsed
		if (Math.abs(kd) > 0 && deltaTime > 0) {
			var derivative;

			if (isNaN(lastDerivative)) {
				lastDerivative = 0;
				derivative = 0;
			} else {
				derivative = (error - lastError) / deltaTime;
			}

			var RC = 1 / (2 * Math.PI * 20);
			derivative = lastDerivative + 
					((deltaTime / (RC + deltaTime)) *
					(derivative - lastDerivative));
			
			lastDerivative = derivative;
			lastError = error;
			output += kd * derivative;
		}

		// Scale the P and D components
		output *= scaler;
		
		// Compute the integral component
		if (Math.abs(ki) > 0 && deltaTime > 0) {
			integrator += (error * ki) * scaler * deltaTime;

			if (0 && debug) {
				console.log('i: ' + integrator + '\terror:' + (error.toString().indexOf('-') !== 0 ? ' ' : '') + error);	
			}
			if (integrator < -iMax) {
				integrator = -iMax;
			} else if (integrator > iMax) {
				integrator = iMax;
			}

			output += integrator;
		}

		return output;

	}

	function resetIntegrator() {
		integrator = 0;
		lastDerivative = NaN;
	}
}


