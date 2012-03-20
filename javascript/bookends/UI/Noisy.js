(function(){

this.Noisy = new Class({

	Implements: [Options, Class.Singleton],

	options: {
		intensity: 0.9, // Noise intensity between [0..1]
		size: 200,
		opacity: 0.08,
		monochrome: false
	},

	initialize: function(element, options){
		this.setOptions(options);
		this.element = document.id(element);
		return this.check(this.element) || this.noisify();
	},

	noisify: function(uri){
		var options = this.options,
			intensity = options.intensity,
			size = options.size,
			opacity = options.opacity;

		if (uri) uri = this.getCachedUri();

		var canvas = this.getCanvas(),
			ctx = canvas.getContext('2d'),
			imgData,
			numPixels = this.getPixelIntensity(intensity, size),
			maxAlpha = this.getMaxAlpha(opacity);

		canvas.width = canvas.height = size;

		imgData = ctx.createImageData( size, size );

		// Add color to random pixels in the canvas
		this.randomizeImageData(imgData, numPixels, maxAlpha);

		uri = canvas.toDataURL('image/png');

		// In IE < 9 Data URI's are only displayed if they are < 32KB
		// Though IE < 9 doesn't officially support the canvas element,
		// certain scripts like excanvas.js will enable it and if the URI is > 32KB it won't be displayed
		if (uri.indexOf('data:image/png') != 0 || // toDataURL doesn't return anything in Android 2.2
		    Browser.ie &&
		    Browser.version < 9 &&
		    uri.length > 32768) {
		}

		this.setCachedUri(options, uri);
		
		// get the existing value for background-image
		var existingBackground = this.element.getStyle('background-image');
		
		if (existingBackground) {
			existingBackground = ", " + existingBackground;
		}
		
		this.element.setStyle('background-image', 'url(' + uri + ')' + existingBackground);

		return this;
	},

	bitwiseRandomize: function(a){
		return ~~(Math.random() * a);
	},

	updateCanvas: function(imgData){
		this.getCanvas().getContext('2d').putImageData(imgData, 0, 0);
		return this;
	},

	randomizeImageData: function(imgData, numPixels, maxAlpha){
		var canvas = this.getCanvas(),
			ctx = canvas.getContext('2d'),
			monochrome = this.options.monochrome;

		if (!ctx) return this;

		while (numPixels--) { // Read about the double bitwise NOT trick here: goo.gl/6DPpt
			var x = this.bitwiseRandomize(canvas.width),
			    y = this.bitwiseRandomize(canvas.height),
			    index = (x + y * imgData.width) * 4,
			    colorChannel = numPixels % 255; // This will look random enough

			imgData.data[index  ] = colorChannel;											// red
			imgData.data[index+1] = monochrome ? colorChannel : this.bitwiseRandomize(255);	// green
			imgData.data[index+2] = monochrome ? colorChannel : this.bitwiseRandomize(255);	// blue
			imgData.data[index+3] = this.bitwiseRandomize(maxAlpha);						// alpha
		}

		this.updateCanvas(imgData);
		return this;
	},

	getPixelIntensity: function(a, b){
		return a * Math.pow( b, 2 );
	},

	getMaxAlpha: function(a){
		return 255 * a;
	},

	setCachedUri: function(options, uri){
		localStorage.setItem(JSON.stringify(options), uri);

		return this;
	},

	getCachedUri: function(){
		return localStorage.getItem(JSON.encode(this.options));
	},

	getCanvas: function(){
		return this.canvas || (this.canvas = document.createElement('canvas'));
	}


});

})();
