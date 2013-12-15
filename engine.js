function Color(r, g, b, a) {
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = a;

	this.setRGBA = function(r, g, b, a) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}

	this.getFullHex = function() {
		return '#' + this.r.toString(16) + this.g.toString(16) + this.b.toString(16) + this.a.toString(16);
	};

	this.getRGBHex = function() {
		return '#' + this.r.toString(16) + this.g.toString(16) + this.b.toString(16);
	};
};

function Vector(dx, dy) {
	this.set = function(dx, dy) {
		this.dx = dx;
		this.dy = dy;
	};

	this.length = function() {
		return Math.sqrt(dx * dx + dy * dy);
	};

	this.normalize = function(length) {
		/** @todo normalization **/
		return this;
	};
	this.set(dx, dy);
};

function Tween(engine, target, props, time) {
	this.target = target;
	this.props = props;
	this.time = time;
	this.done = false;

	this.currentTime = 0;

	this.initialVals = new Object();
	this.targetVals = new Object();

	for (var key in props) {
		this.initialVals[key] = target[key];
		this.targetVals[key] = props[key];
	}

	engine.addTween(this);

	this.step = function(deltaTime) {

		if (this.currentTime >= this.time) {
			this.done = true;
		} else {
			for (var k in this.target) {
				this.target[k] = this.initialVals[k] + (this.targetVals[k] - this.initialVals[k]) * (this.currentTime / this.time);
			};

			this.currentTime += deltaTime;
		}
	};
};

function SpriteAnimation(firstFrame, lastFrame, fps) {
	this.firstFrame = firstFrame;
	this.lastFrame = lastFrame;
	this.frameTime = (1000 / fps);
};

function Sprite() {
	this.image = null;
	this.engine = null;
	this.x = 0;
	this.y = 0;
	this.width = 0;
	this.height = 0;
	this.cx = 0;
	this.cy = 0;
	this.visible = true;
	this.animated = false;
	this.frames = new Array();
	this.frameWidth = 0;
	this.frameHeight = 0;
	this.frameTime = 24;
	this.frameLastTime = 0;
	this.currentFrame = 0;
	this.playAnimation = true;
	this.parent = null;
	this.children = new Array(); // Children Sprites
	this.flipHorizontal = false;
	this.flipVertical = false;
	this.animations = {};
	this.currentAnimation = 'all';
	this.frameCanvas = null;
	this.flippedCopy = null; // Filpped copy of the image
	this.alpha = 1;

	this.resultAlpha = function() {
		if (this.parent == null) {
			return this.alpha;
		} else {
			return this.alpha * this.parent.resultAlpha();
		}
	};

	this.onadded = function(addedTo) {};
	this.onremoved = function(removedFrom) {};

	this.globalX = function() {
		if (this.parent == null) {
			return this.x;
		} else {
			return this.parent.globalX() + this.x;
		}
	};

	this.globalY = function() {
		if (this.parent == null) {
			return this.y;
		} else {
			return this.parent.globalY() + this.y;
		}
	};

	this.addChild = function(sprite) {
		this.children.push(sprite);
		sprite.engine = this.engine;
		sprite.parent = this;
		sprite.onadded(this);
	};

	this.removeChild = function(sprite) {
		var i = this.children.indexOf(sprite);
		if (i !== -1) {
			sprite.parent = null;
			sprite.engine = null;
			sprite.onremoved(this);
			this.children.splice(i, 1);
		}
	}

	/**
	 * Set image for this Sprite
	 */
	this.setImage = function(newImage, createFlippedCopy) {
		if (typeof createFlippedCopy == "undefined")
			createFlippedCopy = true;

		if (createFlippedCopy) {
			this.flippedCopy = document.createElement('canvas');
			this.flippedCopy.width = newImage.width;
			this.flippedCopy.height = newImage.height;

			var ctx = this.flippedCopy.getContext('2d');
			ctx.translate(newImage.width, 0);
			ctx.scale(-1, 1);
			ctx.drawImage(newImage, 0, 0);
		}

		this.image = newImage;
		this.width = newImage.width;
		this.height = newImage.height;
		this.cx = this.width / 2;
		this.cy = this.height / 2;
	};

	this.createAnimClip = function(name, firstFrame, lastFrame, fps) {
		var newAnim = new SpriteAnimation(firstFrame, lastFrame, fps);
		this.animations[name] = newAnim;
	};

	this.setAnim = function(name) {
		if ((typeof this.animations[name] !== "undefined") && (this.currentAnimation != name)) {
			this.currentAnimation = name;
			this.currentFrame = this.animations[name].firstFrame;
		}
	};

	/**
	 * Init Sprite animation
	 */
	this.initAnimation = function(frameWidth, frameHeight, fps) {
		this.frameCanvas = document.createElement('canvas');
		this.frameWidth = this.frameCanvas.width = frameWidth;
		this.frameHeight = this.frameCanvas.height = frameHeight;
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

		this.animations = {
			'all': this.createAnimClip(0, this.frames.length - 1, fps)
		};

		this.width = frameWidth;
		this.height = frameHeight;
		this.cx = this.width / 2;
		this.cy = this.height / 2;
	};

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

	this.onupdate = function(deltaTime) {};

	this.onanimationfinished = function() {};

	this.renderFrame = function(context, frameNum, atX, atY) {
		var imageToDraw = this.flipHorizontal ? this.flippedCopy : this.image;
		var frameNumber = this.flipHorizontal ? (this.frames.length - 1) - frameNum : frameNum;
		var addwidth = this.flipHorizontal ? 0 : 0;

		context.drawImage(imageToDraw, (this.frames[frameNumber].framex + addwidth) * this.frameWidth, this.frames[frameNumber].framey * this.frameHeight, this.frameWidth, this.frameHeight, atX, atY, this.width, this.height);
	};

	/**
	 * Render the Sprite
	 */
	this.render = function(deltaTime) {
		this.onupdate(deltaTime);

		if (!this.visible) {
			return;
		}

		if (this.engine != null) {
			this.engine.context.globalAlpha = this.resultAlpha();

			if (this.image != null) {
				if (this.animated) {
					this.renderFrame(this.engine.context, this.currentFrame, this.globalX() - this.cx, this.globalY() - this.cy);

					if (this.playAnimation) {
						this.frameLastTime += deltaTime;
						if (this.frameLastTime > this.animations[this.currentAnimation].frameTime) {
							this.currentFrame++;
							this.frameLastTime = 0;

							if (this.currentFrame > this.animations[this.currentAnimation].lastFrame) {
								this.currentFrame = this.animations[this.currentAnimation].firstFrame;
								this.onanimationfinished();
							}
						}
					}
				} else {
					var imageToDraw = this.flipHorizontal ? this.flippedCopy : this.image;
					this.engine.context.drawImage(imageToDraw, 0, 0, imageToDraw.width, imageToDraw.height, this.globalX() - this.cx, this.globalY() - this.cy, this.width, this.height);
				}
			}

			for (var i = 0; i < this.children.length; i++) {
				this.children[i].render(deltaTime);
			};
		}
	};
};

function TextSprite(initialText) {
	var tc = document.createElement('canvas');
	var ctx = tc.getContext('2d');

	ctx.font = '8pt MetroidNES';
	ctx.fillStyle = '#4ea5e6';
	ctx.fillText(initialText, 0, 0);

	var metrics = ctx.measureText(initialText);
	tc.width = metrics.width;
	tc.height = metrics.height;

	this.setImage(tc);
};
TextSprite.prototype = new Sprite();

function Sound() {
	function SoundChannel(audio) {
		this.audioObject = new Audio();
		this.audioObject.src = audio.src;
		this.audioObject.load();

		this.isPlaying = false;

		this.canPlay = function() {
			return this.isPlaying || this.audioObject.ended;
		};

		this.play = function(loop) {
			if (typeof loop != "undefined") {
				this.audioObject.loop = loop;
			}
			this.audioObject.play();
			this.isPlaying = true;
		};
	};

	this.maxchannels = 5;

	this.channels = new Array(this.maxchannels);
	this.channelToUse = 0;

	this.play = function(loop) {
		this.channels[this.channelToUse].play(loop);
		this.channelToUse++;
		if (this.channelToUse == this.maxchannels)
			this.channelToUse = 0;
	}

	this.initSound = function(audio) {
		for (var i = 0; i < this.maxchannels; i++) {
			this.channels[i] = new SoundChannel(audio);
		};
	};
};

var Keyboard = {
	key_backspace: 8,
	key_tab: 9,
	key_enter: 13,
	key_shift: 16,
	key_alt: 18,
	key_ctrl: 17,
	key_capslock: 20,
	key_left: 37,
	key_right: 39,
	key_up: 38,
	key_down: 40,
	key_space: 32,
	key_w: 87,
	key_a: 65,
	key_c: 67,
	key_s: 83,
	key_d: 68,
	key_z: 90,
	key_x: 88
};

function Engine(renderID) {
	var engine = this;

	this.canvas = document.getElementById(renderID);
	this.context = this.canvas.getContext('2d');
	this.screenWidth = this.canvas.width;
	this.screenHeight = this.canvas.height;
	this.frameRate = 60;
	this.clearStyle = '#6495ED';
	this.r = {}; // Resources
	this.tweens = new Array();

	this.anykey = false;

	this.addTween = function(tween) {
		this.tweens.push(tween);
	};

	this.setClearStyle = function(newClearStyle) {
		this.clearStyle = newClearStyle;
	};

	/**
	 * Keyboard input handle
	 */
	this.keyDown = new Array(256);
	this.onKeyDown = function(keyboardEvent) {
		engine.keyDown[keyboardEvent.keyCode] = true;
		engine.anykey = true;
		keyboardEvent.preventDefault();
	};
	this.onKeyUp = function(keyboardEvent) {
		engine.keyDown[keyboardEvent.keyCode] = false;
		engine.anykey = false;
		keyboardEvent.preventDefault();
	};
	this.isKeyDown = function(key) {
		return (typeof this.keyDown[key] == "undefined") ? false : this.keyDown[key];
	};
	this.isKeysDown = function(keyArray, all) {
		var result = true;

		if (typeof all == "undefined") all = false;

		for (var i = 0; i < keyArray.length; i++) {
			if (!all) {
				result = false;
				if (this.isKeyDown(keyArray[i])) return true;
			} else {
				result = true;
				if (!this.isKeyDown(keyArray[i])) return false;
			}
		};

		return result;
	};
	this.isLeft = function() {
		return this.isKeyDown(Keyboard.key_left) || this.isKeyDown(Keyboard.key_a);
	};
	this.isRight = function() {
		return this.isKeyDown(Keyboard.key_right) || this.isKeyDown(Keyboard.key_d);
	};
	this.isUp = function() {
		return this.isKeyDown(Keyboard.key_up) || this.isKeyDown(Keyboard.key_w);
	};
	this.isDown = function() {
		return this.isKeyDown(Keyboard.key_down) || this.isKeyDown(Keyboard.key_s);
	};


	/**
	 * Mouse input
	 */
	this.mousePosition = {
		x: 0,
		y: 0
	};
	this.mouseDown = {
		left: false,
		right: false
	};
	this.onMouseMove = function(mouseEvent) {
		engine.mousePosition.x = mouseEvent.offsetX;
		engine.mousePosition.y = mouseEvent.offsetY;
	};
	this.onMouseDown = function(mouseEvent) {
		engine.mouseDown.left = true;
	};
	this.onMouseUp = function(mouseEvent) {
		engine.mouseDown.left = false;
	};

	window.addEventListener("keydown", this.onKeyDown);
	window.addEventListener("keyup", this.onKeyUp);
	this.canvas.addEventListener("mousemove", this.onMouseMove);
	this.canvas.addEventListener("mousedown", this.onMouseDown);
	this.canvas.addEventListener("mouseup", this.onMouseUp);

	/**
	 * Clear canvas
	 *
	 */
	this.clear = function() {
		this.context.clearRect(0, 0, this.screenWidth, this.screenHeight);
		this.context.fillStyle = this.clearStyle;
		this.context.fillRect(0, 0, this.screenWidth, this.screenHeight);
	};

	this.clear();

	this.onrender = null;
	this.root = null;

	this.setRootSprite = function(sprite) {
		this.root = sprite;
		sprite.engine = this;
		sprite.onadded(this);
	};

	/**
	 * Run the game
	 */
	this.run = function() {
		var lastTime = 0;
		var deltaTime = 0;
		var frameCount = 0;

		var render = function(engine) {
			var currentTime = new Date().getTime();
			deltaTime = currentTime - lastTime;
			lastTime = currentTime;

			engine.clear();

			for (var i = 0; i < engine.tweens.length; i++) {
				if (!engine.tweens[i].done) {
					engine.tweens[i].step(deltaTime);
				}
			};

			// use render callback if we have one
			if (engine.onrender !== null) {
				engine.onrender();
				// render root sprtie if we have one
			} else if (engine.root != null) {
				engine.root.render(deltaTime);
			}

			frameCount++;

			setTimeout(function() {
				render(engine);
			}, Math.floor(1000 / engine.frameRate));
		};

		render(this);
	};

	this.initSprite = function(sprite, resourceID) {
		sprite.setImage(this.r[resourceID]);
		sprite.engine = this;
		return sprite;
	}

	/**
	 * Generate Sprite from resource
	 */
	this.getSprite = function(resourceID) {
		var newSprite = new Sprite();
		return this.initSprite(newSprite, resourceID);
	};

	this.playSound = function(soundID, loop) {
		if (typeof this.r[soundID] != "undefined") {
			var sound = this.r[soundID];
			sound.play(loop);
		} else {
			console.log('sound not found:', soundID);
		}
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
					console.log('error loading ' + fullPath)
				};

				this.r[id] = resource;
				break;

			case 'sounds':
				newAudio = new Audio();
				newAudio.src = fullPath;
				newAudio.preload = "auto";
				onDone(engine, id, fullPath);
				resource = new Sound();
				resource.initSound(newAudio);
				this.r[id] = resource;
				break;

			default:
				this.log('Unknown resource type: ' + type);
				break;
		}
	};

	this.onloadingstep = function(progress) {
		this.clear();
		this.context.fillStyle = '#fff';
		this.context.font = 'bold 40px Arial';
		this.context.fillText('Loading: ' + progress + '%', 10, this.canvas.height / 2);
	};

	this.loadResources = function(resourcesArray, baseDir, callback) {
		if (typeof baseDir === "undefined") {
			baseDir = '.';
		};
		var resourcesLoaded = 0;
		var resourcesToLoad = 0;
		var resourceQueue = [];

		this.onloadingstep(0);

		for (var folder in resourcesArray) {
			for (var fileID in resourcesArray[folder]) {
				resourceQueue.push({
					'id': fileID,
					'type': folder,
					'fullPath': './' + baseDir + '/' + folder + '/' + resourcesArray[folder][fileID]
				});
				resourcesToLoad++;
			}
		};

		function engineRun() {
			callback();
			engine.run();
		};

		if (resourcesToLoad > 0) {
			for (var i = resourceQueue.length - 1; i >= 0; i--) {
				this.loadResource(resourceQueue[i]['fullPath'], resourceQueue[i]['type'], resourceQueue[i]['id'], function(engine, id, fullPath) {
					console.log(fullPath + ' loaded');
					engine.onloadingstep(Math.floor(resourcesLoaded / resourcesToLoad * 100));
					resourcesLoaded++;
					if (resourcesToLoad == resourcesLoaded) {
						engineRun();
					}
				});
			};
		} else {
			engineRun();
		}
	};
};