/*!
 *  Here will be some desctiption about this code
 */
(function(window) {
    /**
     * Vector utility object
     */
    function Vector(dx, dy) {
        this.dx = dx;
        this.dy = dy;
    }

    Vector.prototype.set = function(dx, dy) {
        this.dx = dx;
        this.dy = dy;
        return this;
    }

    Vector.prototype.mult_scalar = function(k) {
        this.dx *= k;
        this.dy *= k;
        return this;
    }

    Vector.prototype.length = function() {
        return Math.sqrt((this.dx * this.dx) + (this.dy * this.dy));
    }

    Vector.prototype.normalize = function(length) {
        if (typeof length === "undefined")
            length = 1;

        var l = this.length();

        this.dx = (this.dx / l) * length;
        this.dy = (this.dy / l) * length;
        return this;
    }

    /**
     * The Sprite object
     */
    function Sprite() {
        this.alpha = 1;
        this.animated = false;
        this.animations = {};
        this.children = new Array(); // Children Sprites
        this.currentAnimation = 'all';
        this.currentFrame = 0;
        this.cx = 0;
        this.cy = 0;
        this.flipHorizontal = false;
        this.flippedCopy = null; // Filpped copy of the image
        this.flipVertical = false;
        this.frameCanvas = null;
        this.frameHeight = 0;
        this.frameLastTime = 0;
        this.frames = new Array();
        this.frameTime = 24;
        this.frameWidth = 0;
        this.height = 0;
        this.image = null;
        this.parent = null;
        this.playAnimation = true;
        this.repeatX = 1;
        this.repeatY = 1;
        this.rotation = 0
        this.visible = true;
        this.width = 0;
        this.x = 0;
        this.y = 0;

        /** Events **/
        this.onadded = null;
        this.onremoved = null;
        this.onupdate = null;
        this.onanimationfinished = null;
    }

    function SpriteAnimation(firstFrame, lastFrame, fps) {
        this.firstFrame = firstFrame;
        this.lastFrame = lastFrame;
        this.frameTime = (1000 / fps);
    }

    Sprite.prototype.init = function(callback) {
        callback.call(this);
        return this;
    }

    /**
     * Add a child sprite
     */
    Sprite.prototype.addChild = function(sprite) {
        this.children.push(sprite);
        sprite.parent = this;

        if (sprite.onadded != null)
            sprite.onadded(this);

        return this;
    }

    /**
     * Set function on finished animation
     */
    Sprite.prototype.animationfinished = function(animationFinishedFunction) {
        this.onanimationfinished = animationFinishedFunction;
        return this;
    }

    Sprite.prototype.createAnimClip = function(name, firstFrame, lastFrame, fps) {
        var newAnim = new SpriteAnimation(firstFrame, lastFrame, fps);
        this.animations[name] = newAnim;

        return this;
    }

    /**
     * Get global X
     */
    Sprite.prototype.globalX = function() {
        if (this.parent == null) {
            return this.x;
        } else {
            return this.parent.globalX() + this.x;
        }
    }

    /**
     * Get gloval Y
     */
    Sprite.prototype.globalY = function() {
        if (this.parent == null) {
            return this.y;
        } else {
            return this.parent.globalY() + this.y;
        }
    }

    /**
     * Init Sprite animation
     */
    Sprite.prototype.initAnimation = function(frameWidth, frameHeight, fps) {
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

        return this;
    }

    /**
     * Remove a child from the sprite
     */
    Sprite.prototype.removeChild = function(sprite) {
        var i = this.children.indexOf(sprite);
        if (i !== -1) {
            sprite.parent = null;
            if (sprite.onremoved !== null)
                sprite.onremoved(this);
            this.children.splice(i, 1);
        }

        return this;
    }

    /**
     * The alpha value of the current sprite multiplied by partnt sprite alpha value
     */
    Sprite.prototype.resultAlpha = function() {
        if (this.parent == null) {
            return this.alpha;
        } else {
            return this.alpha * this.parent.resultAlpha();
        }
    }

    /**
     * Set image for this Sprite
     */
    Sprite.prototype.setImage = function(newImage, createFlippedCopy) {
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

        return this;
    }

    /**
     * Set current animation
     */
    Sprite.prototype.setAnim = function(name) {
        if ((typeof this.animations[name] !== "undefined") && (this.currentAnimation != name)) {
            this.currentAnimation = name;
            this.currentFrame = this.animations[name].firstFrame;
        }

        return this;
    }

    /**
     * Set center
     */
    Sprite.prototype.setCenter = function(cx, cy) {
        this.cx = cx;
        this.cy = cy;
        return this;
    }

    /**
     * Set the position of the sprite
     */
    Sprite.prototype.setPosition = function(newx, newy) {
        this.x = newx;
        this.y = newy;
        return this;
    }

    /**
     * Set repeat
     */
    Sprite.prototype.setRepeat = function(nx, ny) {
        this.repeatX = nx;
        this.repeatY = ny;
        return this;
    }

    Sprite.prototype.move = function(dx, dy) {
        this.x += dx;
        this.y += dy;
        return this;
    }

    /**
     * Pause current animation
     */
    Sprite.prototype.pause = function() {
        this.playAnimation = false;
        return this;
    }

    /**
     * Stop current animation
     */
    Sprite.prototype.stop = function() {
        this.pause();
        this.currentFrame = 0;
        return this;
    }

    /**
     * Play current animation
     */
    Sprite.prototype.play = function() {
        this.playAnimation = true;
        return this;
    }

    /**
     * Render a single frame at the context
     */
    Sprite.prototype.renderFrame = function(context, frameNum, atX, atY) {
        var imageToDraw = this.flipHorizontal ? this.flippedCopy : this.image;
        var frameNumber = this.flipHorizontal ? (this.frames.length - 1) - frameNum : frameNum;
        var addwidth = this.flipHorizontal ? 0 : 0;

        context.drawImage(imageToDraw, (this.frames[frameNumber].framex + addwidth) * this.frameWidth, this.frames[frameNumber].framey * this.frameHeight, this.frameWidth, this.frameHeight, atX, atY, this.width, this.height);
    }

    Sprite.prototype.matrix_setup = function() {
        (function(ctx, sprite) {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.globalAlpha = sprite.resultAlpha();
            ctx.translate(sprite.globalX(), sprite.globalY());
            ctx.rotate(sprite.rotation);
        })(engine.context, this);
    }

    /**
     * Render the Sprite
     */
    Sprite.prototype.render = function(deltaTime) {
        if (!this.visible) {
            return;
        }

        if (this.onupdate !== null) {
            this.onupdate(deltaTime);
        }

        if (engine != null) {
            this.matrix_setup();

            if (this.image != null) {
                if (this.animated) {
                    this.renderFrame(engine.context, this.currentFrame, -this.cx, -this.cy);

                    if (this.playAnimation) {
                        this.frameLastTime += deltaTime;
                        if (this.frameLastTime > this.animations[this.currentAnimation].frameTime) {
                            this.currentFrame++;
                            this.frameLastTime = 0;

                            if (this.currentFrame > this.animations[this.currentAnimation].lastFrame) {
                                this.currentFrame = this.animations[this.currentAnimation].firstFrame;
                                if (this.onanimationfinished !== null) {
                                    this.onanimationfinished();
                                }
                            }
                        }
                    }
                } else {
                    var imageToDraw = this.flipHorizontal ? this.flippedCopy : this.image;

                    for (var i = 0; i < this.repeatX; i++) {
                        for (var j = 0; j < this.repeatY; j++) {
                            engine.context.drawImage(imageToDraw, 0, 0, imageToDraw.width, imageToDraw.height, -this.cx + i * imageToDraw.width, -this.cy + j * imageToDraw.height, this.width, this.height);
                        };
                    };
                }
            }
        };

        for (var i = 0; i < this.children.length; i++) {
            this.children[i].render(deltaTime);
        };
    }

    /**
     * Set update function
     */
    Sprite.prototype.update = function(updateFunction) {
        this.onupdate = updateFunction;
        return this;
    }

    /**
     * Sound Channel
     */
    function SoundChannel(audio) {
        this.audioObject = new Audio();
        this.audioObject.src = audio.src;
        this.audioObject.load();
        this.isPlaying = false;
    }

    /**
     * Is it possible to play this channel
     */
    SoundChannel.prototype.canPlay = function() {
        return this.isPlaying || this.audioObject.ended;
    }

    /**
     * Play the sound channel
     */
    SoundChannel.prototype.play = function(loop) {
        if (typeof loop != "undefined") {
            this.audioObject.loop = loop;
        }
        this.audioObject.play();
        this.isPlaying = true;
    }

    function Sound() {
        this.maxchannels = 5;
        this.channels = new Array(this.maxchannels);
        this.channelToUse = 0;
    }

    Sound.prototype.play = function(loop) {
        this.channels[this.channelToUse].play(loop);
        this.channelToUse++;
        if (this.channelToUse == this.maxchannels)
            this.channelToUse = 0;
    }

    Sound.prototype.initSound = function(audio) {
        for (var i = 0; i < this.maxchannels; i++) {
            this.channels[i] = new SoundChannel(audio);
        };
    }

    function Keyboard(canvas) {
        this.key_backspace = 8;
        this.key_tab = 9;
        this.key_enter = 13;
        this.key_shift = 16;
        this.key_alt = 18;
        this.key_ctrl = 17;
        this.key_capslock = 20;
        this.key_left = 37;
        this.key_right = 39;
        this.key_up = 38;
        this.key_down = 40;
        this.key_space = 32;
        this.key_w = 87;
        this.key_a = 65;
        this.key_c = 67;
        this.key_s = 83;
        this.key_d = 68;
        this.key_z = 90;
        this.key_x = 8;

        this.anykey = false;

        this.keyDown = new Array(256);

        (function(keyboard) {
            canvas.addEventListener("keydown", function(keyboardEvent) {
                keyboard.keyDown[keyboardEvent.keyCode] = true;
                keyboard.anykey = true;
                keyboardEvent.preventDefault();
            });
            canvas.addEventListener("keyup", function(keyboardEvent) {
                keyboard.keyDown[keyboardEvent.keyCode] = false;
                keyboard.anykey = false;
                keyboardEvent.preventDefault();
            });
        })(this);
    }

    Keyboard.prototype.isKeyDown = function(key) {
        return (typeof this.keyDown[key] == "undefined") ? false : this.keyDown[key];
    }

    Keyboard.prototype.isKeysDown = function(keyArray, all) {
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
    }

    Keyboard.prototype.isLeft = function() {
        return this.isKeyDown(Keyboard.key_left) || this.isKeyDown(Keyboard.key_a);
    }

    Keyboard.prototype.isRight = function() {
        return this.isKeyDown(Keyboard.key_right) || this.isKeyDown(Keyboard.key_d);
    }

    Keyboard.prototype.isUp = function() {
        return this.isKeyDown(Keyboard.key_up) || this.isKeyDown(Keyboard.key_w);
    }

    Keyboard.prototype.isDown = function() {
        return this.isKeyDown(Keyboard.key_down) || this.isKeyDown(Keyboard.key_s);
    }

    function Mouse(engine, canvas) {
        this.x = 0;
        this.y = 0;

        this.left = false;
        this.right = false;

        this.ondown = null;
        this.onup = null;

        (function(canvas, mouse) {
            canvas.addEventListener("mousemove", function(mouseEvent) {
                mouse.x = mouseEvent.offsetX - engine.screenWidth / 2;
                mouse.y = mouseEvent.offsetY - engine.screenHeight / 2;
            });
            canvas.addEventListener("mousedown", function(mouseEvent) {
                if (!mouse.left) {
                    if (mouse.ondown != null)
                        mouse.ondown.call(mouse);
                }
                mouse.left = true;
            });
            canvas.addEventListener("mouseup", function(mouseEvent) {
                if (mouse.left) {
                    if (mouse.onup != null)
                        mouse.onup.call(mouse);
                }
                mouse.left = false;
            });
        })(canvas, this);
    }

    Mouse.prototype.down = function(callback) {
        this.ondown = callback;
    }

    Mouse.prototype.up = function(callback) {
        this.onup = callback;
    }

    function ResourceManager() {
        this.resSource = new Array();
        this.res = new Array();
        this.onloadingstep = null;
    }

    ResourceManager.prototype.get = function(ID) {
        return this.res[ID];
    }

    ResourceManager.prototype.add = function(type, path) {
        this.resSource.push({
            'type': type,
            'path': path
        });
        return this;
    }

    ResourceManager.prototype.addArray = function(resources) {
        function getExt(fileName) {
            return (fileName.split('.').pop()).toLowerCase();
        }

        function getType(ext) {
            switch (ext) {
                case 'png':
                case 'jpg':
                case 'jpeg':
                case 'gif':
                    return 'image';
                case 'ogg':
                case 'mp3':
                    return 'audio';
                case 'json':
                    return 'json';
                default:
                    return false;
            }
        }

        for (var i = 0; i < resources.length; i++) {
            var resource_type = getType(getExt(resources[i]));
            if (resource_type !== false) {
                this.add(resource_type, resources[i]);
            }
        };
    }

    ResourceManager.prototype.loadingStep = function(percent) {
        if (this.onloadingstep !== null) {
            this.onloadingstep(percent);
        }
    }

    ResourceManager.prototype.loadResource = function(path, type, callback) {
        function getID() {
            var id_str = path.split('/').pop();
            return id_str.split('.').shift();
        }

        var resource;

        var id = getID();
        var id_inc = 1;

        while (typeof this.res[id] !== "undefined") {
            id = getID() + "_" + id_inc;
            id_inc++;
        }

        switch (type) {
            case 'image':
                resource = new Image();
                resource.src = path;
                resource.onload = function() {
                    callback();
                };

                resource.onerror = function() {
                    console.log('error loading:', path);
                };

                this.res[id] = resource;
                break;

            case 'audio':
                newAudio = new Audio();
                newAudio.src = path;
                newAudio.preload = "auto";
                resource = new Sound();
                resource.initSound(newAudio);
                this.res[id] = resource;
                callback();
                break;

            case 'json':
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.open('GET', path, true);
                (function(resourceManager) {
                    xmlhttp.onreadystatechange = function() {
                        if (xmlhttp.readyState == 4) {
                            if (xmlhttp.status == 200) {
                                var jobj = JSON.parse(xmlhttp.responseText);
                                if (typeof jobj !== "undefined") {
                                    resourceManager.res[id] = jobj;
                                    callback();
                                } else {
                                    console.log('json parse error:', path);
                                }
                            } else {
                                console.log('error loading:', path);
                            }
                        }
                    };
                })(this);
                xmlhttp.send(null);
                break;
        }
    }

    ResourceManager.prototype.loadAll = function(callback) {
        var resourcesLoaded = 0;
        var resourceToLoad = this.resSource.length;
        this.loadingStep(0);

        if (this.resSource.length > 0) {
            for (var i = 0; i < this.resSource.length; i++) {
                (function(resourceManager) {
                    resourceManager.loadResource(resourceManager.resSource[i]['path'], resourceManager.resSource[i]['type'], function() {
                        resourcesLoaded++;
                        resourceManager.loadingStep(Math.floor((resourcesLoaded / resourceToLoad) * 100));

                        if (resourcesLoaded == resourceToLoad) {
                            callback();
                        }
                    });
                })(this);
            };
        } else {
            callback();
        }

        return this;
    }

    function PH_Rect() {
        this.fillStyle = 'yellow';
        this.strokeStyle = 'grey';
        this.lineWidth = 1;
    }

    PH_Rect.prototype = new Sprite();

    PH_Rect.prototype.setSize = function(sx, sy) {
        this.width = sx;
        this.height = sy;
        this.cx = sx / 2;
        this.cy = sy / 2;
        return this;
    }

    PH_Rect.prototype.render = function(deltaTime) {
        this.matrix_setup();
        (function(ctx, rect) {
            ctx.beginPath();
            ctx.rect(-rect.cx, -rect.cy, rect.width, rect.height);
            ctx.fillStyle = rect.fillStyle;
            ctx.fill();
            ctx.lineWidth = rect.lineWidth;
            ctx.strokeStyle = rect.strokeStyle;
            ctx.stroke();
        })(engine.context, this);
    }

    function Placeholders() {

    }

    Placeholders.prototype.rect = function(sx, sy) {
        var r = new PH_Rect();
        r.setSize(sx, sy);
        return r;
    }

    /**
     * Core Engine unit
     */
    function Engine() {
        this.canvas = null;
        this.children = [];
        this.context = null;
        this.mouse = null;
        this.onready = null;
        this.placeholders = new Placeholders();
        this.resources = new ResourceManager();
        this.screenHeight = 0;
        this.screenWidth = 0;

        (function(engine) {
            engine.resources.onloadingstep = function(percent) {
                engine.clear();
                engine.context.fillStyle = '#fff';
                engine.context.font = 'bold 40px Arial';
                engine.context.textAlign = 'center';
                engine.context.fillText('Loading: ' + percent + '%', engine.canvas.width / 2, engine.canvas.height / 2);
            }
        })(this);
    }

    Engine.prototype.vec2d = function(dx, dy) {
        return new Vector(dx, dy);
    }

    Engine.prototype.log = function() {
        console.log.apply(console, arguments);
    }

    Engine.prototype.error = function(message) {
        console.log(message);
    }

    Engine.prototype.resize = function(newWidth, newHeight) {
        this.canvas.width = this.screenWidth = newWidth;
        this.canvas.height = this.screenHeight = newHeight;
    }

    Engine.prototype.update = function(callback) {
        this.onupdate = callback;
    }

    /**
     * Start the Engine
     *
     */
    Engine.prototype.run = function() {
        (function(engine) {
            var lastTime = 0;
            var deltaTime = 0;
            var frameCount = 0;

            var countFps = function() {
                engine.fps = frameCount;
                frameCount = 0;
            };

            setInterval(function() {
                countFps();
            }, 1000);

            var render = function() {
                var currentTime = new Date().getTime();
                deltaTime = currentTime - lastTime;
                lastTime = currentTime;

                if (engine.onupdate != null) {
                    engine.onupdate.call(engine);
                }

                engine.clear();

                for (var i = 0; i < engine.children.length; i++) {
                    engine.children[i].render(deltaTime);
                };

                frameCount++;

                setTimeout(function() {
                    render();
                }, Math.floor(1000 / engine.frameRate));
            };

            render();
        })(this);
        return this;
    }

    Engine.prototype.init = function(options) {
        (function(engine) {
            var canvas = null;

            if (typeof options['canvas'] !== "undefined") {
                canvas = document.getElementById(options['canvas']);
            } else {
                canvas = document.createElement('canvas');
                document.body.appendChild(engine.canvas);
            }

            if (canvas != null) {
                engine.mouse = new Mouse(engine, canvas);
                engine.keyboard = new Keyboard(canvas);
                engine.canvas = canvas;
                engine.context = engine.canvas.getContext('2d');

                if ((typeof options['fullScreen'] !== "undefined") && (options['fullScreen'] === true)) {
                    document.body.style.margin = 0;
                    window.onresize = function() {
                        engine.resize(document.body.clientWidth, document.body.clientHeight);
                    }

                    window.onresize();
                } else {
                    engine.screenWidth = engine.canvas.width;
                    engine.screenHeight = engine.canvas.height;
                }

                engine.frameRate = typeof options['frameRate'] == "undefined" ? 60 : options['frameRate'];
                engine.clearStyle = typeof options['clearColor'] == "undefined" ? '#6495ED' : options['clearColor'];
                engine.clear();

                var readyfunc = function() {
                    if (typeof options['ready'] === "function") {
                        options['ready'].call();
                    }
                    engine.run();
                }

                if (typeof options['resources'] !== "undefined") {
                    engine.resources.addArray(options['resources']);
                    engine.resources.loadAll(function() {
                        readyfunc();
                    });
                } else {
                    readyfunc();
                }
            } else {
                engine.error("Canvas <#" + options['canvas'] + "> not found!");
            }
        })(this);
    }

    Engine.prototype.ready = function(readyFunction) {
        this.onready = readyFunction;
        return this;
    }

    Engine.prototype.globalX = function() {
        return this.screenWidth / 2;
    }

    Engine.prototype.globalY = function() {
        return this.screenHeight / 2;
    }

    Engine.prototype.resultAlpha = function() {
        return 1;
    }

    Engine.prototype.clear = function() {
        this.canvas.width = this.canvas.width;
        this.context.fillStyle = this.clearStyle;
        this.context.fillRect(0, 0, this.screenWidth, this.screenHeight);

    }

    Engine.prototype.addChild = function(sprite) {
        this.children.push(sprite);
        sprite.parent = this;
        if (sprite.onadded !== null)
            sprite.onadded(this);
        return this;
    }

    Engine.prototype.removeChild = function(sprite) {
        var index = this.children.indexOf(sprite);
        if (index !== -1) {
            sprite.parent = null;
            if (sprite.onremoved !== null)
                sprite.onremoved(this);
            this.children.splice(index, 1);
        }
        return this;
    }

    /**
     * Generate Sprite from resource
     */
    Engine.prototype.sprite = function(resourceID, add) {
        var newSprite;

        if (typeof resourceID == "undefined") {
            newSprite = new Sprite();
        } else {
            newSprite = new Sprite().setImage(this.resources.res[resourceID]);
        }

        if (typeof add !== "undefined") {
            this.addChild(newSprite);
        }

        return newSprite;
    }

    /**
     * Play sound by its ID
     */
    Engine.prototype.sound = function(soundID) {
        if (typeof this.resources.res[soundID] != "undefined") {
            var soundObj = this.resources.res[soundID];
            return soundObj;
        } else {
            console.log('sound not found:', soundID);
        }
    }

    window["engine"] = new Engine();
})(window);