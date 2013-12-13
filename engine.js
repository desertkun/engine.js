function Sprite() {
	this.x = 0;
	this.y = 0;
	this.image = null;
	this.engine = null;
	this.width = 0;
	this.height = 0;
	this.animated = false;
	this.frames = [];
	this.frameWidth = 0;
	this.frameHeight = 0;
	this.frameTime = 24;
	this.frameLastTime = 0;
	this.currentFrame = 0;
	this.playAnimation = false;

	/**
	 * Set image for this Sprite
	 */
	this.setImage = function(newImage) {
		this.image = newImage;
		this.width = newImage.width;
		this.height = newImage.height;
	};

	/**
	 * Init Sprite animation
	 */
	this.initAnimation = function(frameWidth, frameHeight, fps) {
		this.frameWidth = frameWidth;
		this.frameHeight = frameHeight;
		this.frameTime = Math.floor(1000 / fps);
		this.animated = true;

		for (var framey = 0; framey < this.height / frameHeight; framey++) {
			for (var framex = 0; framex < this.width / frameWidth; framex++) {
				this.frames.push({
					'framex': framex,
					'framey': framey
				});
			};
		};

		this.width = frameWidth;
		this.height = frameHeight;
	};

	this.deltaTime = 0;

	var lastTime = new Date().getTime();

	this.pause = function() {
		this.playAnimation = false;
	};

	this.stop = function() {
		this.pause();
		this.currentFrame = 0;
	};

	this.play = function() {
		this.playAnimation = true;
	};

	/**
	 * Render the Sprite
	 */
	this.render = function() {

		var currentTime = new Date().getTime();
		this.deltaTime = currentTime - lastTime;
		lastTime = currentTime;


		if ((this.engine != null) && (this.image != null)) {
			if (this.animated) {
				this.engine.context.drawImage(this.image, this.frames[this.currentFrame].framex * this.frameWidth, this.frames[this.currentFrame].framey * this.frameHeight, this.frameWidth, this.frameHeight, this.x, this.y, this.width, this.height);

				if(this.playAnimation) {
					this.frameLastTime += this.deltaTime;
					if (this.frameLastTime >= this.frameTime) {
						this.currentFrame++;
						this.frameLastTime = 0;
						if (this.currentFrame == this.frames.length) {
							this.currentFrame = 0;
						}
					}
				}
			} else {
				this.engine.context.drawImage(this.image, this.x, this.y);
			}
		}
	};
};

function Engine(renderID, debug) {
	var engine = this;

	this.canvas = document.getElementById(renderID);
	this.context = this.canvas.getContext('2d');
	this.screenWidth = this.canvas.width;
	this.screenHeight = this.canvas.height;
	this.clearStyle = '#6495ED';
	this.r = {};
	this.debug = (typeof debug == "undefined") ? false : (debug === true);

	/**
	 * Keyboard input handle
	 */
	this.keyDown = new Array(256);
	this.onKeyDown = function(keyboardEvent) {
		engine.keyDown[keyboardEvent.keyCode] = true;
	};
	this.onKeyUp = function(keyboardEvent) {
		engine.keyDown[keyboardEvent.keyCode] = false;
	};
	this.isLeft = function() {
		return this.keyDown[37] || this.keyDown[65];
	};
	this.isRight = function() {
		return this.keyDown[39] || this.keyDown[68];
	};
	this.isUp = function() {
		return this.keyDown[38] || this.keyDown[87];
	};
	this.isDown = function() {
		return this.keyDown[40] || this.keyDown[83];
	};
	window.addEventListener("keydown", this.onKeyDown);
	window.addEventListener("keyup", this.onKeyUp);

	/**
	 * Write log message
	 *
	 */
	this.log = function() {
		if (this.debug) {
			console.log(arguments);
		}
	};

	/**
	 * Clear canvar
	 *
	 */
	this.clear = function() {
		this.context.fillStyle = this.clearStyle;
		this.context.fillRect(0, 0, this.screenWidth, this.screenHeight);
	};

	this.clear();

	this.onrender = function() {};

	/**
	 * Run the game
	 */
	this.run = function() {
		var render = function(engine) {
			engine.clear();
			engine.onrender();
			setTimeout(function() {
				render(engine);
			}, 1000 / 60);
		};

		render(this);
	};

	/**
	 * Generate Sprite from resource
	 */
	this.getSprite = function(resourceID) {
		var newSprite = new Sprite(this.r[resourceID], this);
		newSprite.setImage(this.r[resourceID]);
		newSprite.engine = this;
		return newSprite;
	};

	/**
	 * Load Resource
	 */
	this.loadResource = function(fullPath, type, id, onDone) {
		var resource;
		var engine = this;

		switch (type) {
			case 'images':
				resource = new Image();
				resource.src = fullPath;
				resource.onload = function() {
					onDone(engine, id, fullPath);
				};

				resource.onerror = function() {
					this.log('error loading ' + fullPath)
				};

				this.r[id] = resource;
				break;

			case 'sounds':
				resource = new Audio();
				resource.src = fullPath;
				resource.preload = "auto";
				onDone(engine, id, fullPath);
				break;

			default:
				this.log('Unknown resource type: ' + type);
				break;
		}
	};

	this.loadResources = function(resourcesArray, baseDir, callback) {
		if (typeof baseDir === "undefined") {
			baseDir = '.';
		};
		var resourcesLoaded = 0;
		var resourcesToLoad = 0;
		var resourceQueue = [];
		this.context.fillStyle = '#000';
		this.context.font = 'bold 40px Arial';
		this.context.fillText('Loading', 10, this.canvas.height / 2);

		for (var folder in resourcesArray) {
			for (var fileID in resourcesArray[folder]) {
				resourceQueue.push({
					'id': fileID,
					'type': folder,
					'fullPath': baseDir + '/' + folder + '/' + resourcesArray[folder][fileID]
				});
				resourcesToLoad++;
			}
		};

		for (var i = resourceQueue.length - 1; i >= 0; i--) {
			this.loadResource(resourceQueue[i]['fullPath'], resourceQueue[i]['type'], resourceQueue[i]['id'], function(engine, id, fullPath) {
				console.log('Loaded: ' + fullPath);
				resourcesLoaded++;
				if (resourcesToLoad == resourcesLoaded) {
					callback();
					engine.run();
				}
			});
		};
	};
};