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

    function CollisionShape() {
        this.x = 0;
        this.y = 0;
        this.parent = null;
        this.dynamic = false;
    }

    CollisionShape.prototype.globalX = function() {
        return this.parent.globalX() + this.x;
    }

    CollisionShape.prototype.globalY = function() {
        return this.parent.globalY() + this.y;
    }

    CollisionShape.prototype.matrix_setup = function(ctx) {
        ctx.globalAlpha = 0.5;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate(this.globalX(), this.globalY());
    }

    CollisionShape.prototype.debugRender = function(ctx) {

    }

    CollisionShape.prototype.test = function(contractor) {

    }

    function CollisionCircle(radius) {
        this.radius = radius;
    }
    CollisionCircle.prototype = new CollisionShape();

    CollisionCircle.prototype.test = function(contractor) {
        if (contractor instanceof CollisionRect) {
            var dx = contractor.globalX() - this.globalX();
            var dy = contractor.globalY() - this.globalY();

            var mindx = this.radius + contractor.halfWidth;
            var mindy = this.radius + contractor.halfHeight;

            if ((Math.abs(dx) < mindx) && (Math.abs(dy) < mindy)) {
                var offsetx = mindx - Math.abs(dx);
                var offsety = mindy - Math.abs(dy);

                if (Math.abs(offsetx) > Math.abs(offsety)) {
                    if (dy < 0) {
                        this.parent.doCollision(0, -offsety, contractor);
                    } else {
                        this.parent.doCollision(0, offsety, contractor);
                    }
                } else {
                    if (dx < 0) {
                        this.parent.doCollision(-offsetx, 0, contractor);
                    } else {
                        this.parent.doCollision(offsetx, 0, contractor);
                    }
                }
            }
        }
    }

    CollisionCircle.prototype.debugRender = function(ctx) {
        this.matrix_setup(ctx);
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#f00';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#ff0';
        ctx.stroke();
    }

    function CollisionRect(halfWidth, halfHeight) {
        this.halfWidth = halfWidth;
        this.halfHeight = halfHeight;
    }

    CollisionRect.prototype = new CollisionShape();

    CollisionRect.prototype.debugRender = function(ctx) {
        this.matrix_setup(ctx);
        ctx.beginPath();
        ctx.rect(-this.halfWidth, -this.halfHeight, this.halfWidth * 2, this.halfHeight * 2);
        ctx.fillStyle = '#f00';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#ff0';
        ctx.stroke();
    }

    /**
     * The Sprite object
     */
    function Sprite() {
        this.alpha = 1;
        this.animated = false;
        this.animations = {};
        this.children = new Array();
        this.collisionsEnabled = false;
        this.collisionShape = null;
        this.currentAnimation = 'all';
        this.currentFrame = 0;
        this.cx = 0;
        this.cy = 0;
        this.flipHorizontal = false;
        this.flippedCopy = null;
        this.flipVertical = false;
        this.frameCanvas = null;
        this.frameHeight = 0;
        this.frameLastTime = 0;
        this.frames = new Array();
        this.frameTime = 24;
        this.frameWidth = 0;
        this.height = 0;
        this.image = null;
        this.mouseIsOver = false;
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
        this.onanimationfinished = null;
        this.oncollision = null;
        this.onmousedown = null;
        this.onmouseenter = null;
        this.onmouseleave = null;
        this.onmouseup = null;
        this.onremoved = null;
        this.onupdate = null;
    }

    function SpriteAnimation(firstFrame, lastFrame, fps) {
        this.firstFrame = firstFrame;
        this.frameTime = (1000 / fps);
        this.lastFrame = lastFrame;
    }

    Sprite.prototype.mouseEnter = function(callback) {
        this.onmouseenter = callback;
        return this;
    }

    Sprite.prototype.mouseLeave = function(callback) {
        this.onmouseleave = callback;
        return this;
    }

    Sprite.prototype.doCollision = function(offsetx, offsety, contractor) {
        if (typeof this.oncollision === "function") {
            this.oncollision.call(this, offsetx, offsety, contractor);
        }
    }

    Sprite.prototype.collision = function(callback) {
        this.oncollision = callback;
        return this;
    }

    Sprite.prototype.init = function(callback) {
        callback.call(this);
        return this;
    }

    Sprite.prototype.setCollisionShape = function(cs, dynamic) {
        this.collisionShape = cs;
        this.collisionShape.parent = this;
        this.collisionShape.dynamic = dynamic;
    }

    Sprite.prototype.initCollisionCircle = function(radius, dynamic) {
        this.setCollisionShape(new CollisionCircle(radius), dynamic);
        return this;
    }

    Sprite.prototype.initCollisionRect = function(halfWidth, halfHeight, dynamic) {
        this.setCollisionShape(new CollisionRect(halfWidth, halfHeight), dynamic);
        return this;
    }

    /**
     * Add a child sprite
     */
    Sprite.prototype.addChild = function(sprite) {
        this.children.push(sprite);
        sprite.parent = this;

        if (typeof sprite.onadded === "function")
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
        this.animated = true;
        this.frameCanvas = document.createElement('canvas');
        this.frameHeight = this.frameCanvas.height = frameHeight;
        this.frameTime = Math.floor(1000 / fps);
        this.frameWidth = this.frameCanvas.width = frameWidth;

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

    Sprite.prototype.setAlpha = function(alpha) {
        this.alpha = alpha;
        return this;
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

    Sprite.prototype.setRotation = function(r) {
        this.rotation = r;
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

            for (var i = 0; i < this.children.length; i++) {
                this.children[i].render(deltaTime);
            };

            if ((this.collisionShape != null) && (engine.debug)) {
                this.collisionShape.debugRender(engine.context);
            }
        };
    }

    Sprite.prototype.doUpdate = function(deltaTime) {
        if ((typeof this.onmouseenter === "function") || (typeof this.onmouseleave === "function")) {
            if (((engine.mouse.globalX() > (this.globalX() - this.width / 2)) && (engine.mouse.globalX() < (this.globalX() + this.width / 2))) && ((engine.mouse.globalY() > (this.globalY() - this.height / 2)) && (engine.mouse.globalY() < (this.globalY() + this.height / 2)))) {
                if (!this.mouseIsOver) {
                    this.mouseIsOver = true;
                    if (typeof this.onmouseenter === "function") {
                        this.onmouseenter.call(this);
                    }
                }
            } else {
                if (this.mouseIsOver) {
                    this.mouseIsOver = false;
                    if (typeof this.onmouseleave === "function") {
                        this.onmouseleave.call(this);
                    }
                }
            }
        }

        if (this.collisionsEnabled) {
            if (this.children.length >= 2) {
                for (var i = 0; i < this.children.length; i++) {
                    if (this.children[i].collisionShape != null) {
                        if (this.children[i].collisionShape.dynamic) {
                            var op1 = this.children[i];
                            for (var j = 0; j < this.children.length; j++) {
                                if (this.children[j] !== op1) {
                                    var op2 = this.children[j];

                                    op1.collisionShape.test(op2.collisionShape);
                                }
                            };
                        }
                    }
                };
            }
        }

        for (var i = 0; i < this.children.length; i++) {
            this.children[i].doUpdate(deltaTime);
        };

        if (typeof this.onupdate === "function") {
            this.onupdate.call(this, deltaTime);
        }
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
        return this;
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
        return this;
    }

    Sound.prototype.initSound = function(audio) {
        for (var i = 0; i < this.maxchannels; i++) {
            this.channels[i] = new SoundChannel(audio);
        };
        return this;
    }

    function Keyboard(canvas) {
        this.key_a = 65;
        this.key_alt = 18;
        this.key_backspace = 8;
        this.key_c = 67;
        this.key_capslock = 20;
        this.key_ctrl = 17;
        this.key_d = 68;
        this.key_down = 40;
        this.key_enter = 13;
        this.key_left = 37;
        this.key_right = 39;
        this.key_s = 83;
        this.key_shift = 16;
        this.key_space = 32;
        this.key_tab = 9;
        this.key_up = 38;
        this.key_w = 87;
        this.key_x = 8;
        this.key_z = 90;

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

    Mouse.prototype.globalX = function() {
        return this.x + (engine.screenWidth / 2);
    }

    Mouse.prototype.globalY = function() {
        return this.y + (engine.screenHeight / 2);
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

    function PH_Base() {
        this.fillStyle = 'yellow';
        this.strokeStyle = 'grey';
        this.lineWidth = 1;
    }

    PH_Base.prototype = new Sprite();

    PH_Base.prototype.fill = function(style) {
        this.fillStyle = style;
        return this;
    }

    PH_Base.prototype.stroke = function(style) {
        this.strokeStyle = style;
        return this;
    }

    function PH_Rect() {

    }

    PH_Rect.prototype = new PH_Base();

    PH_Rect.prototype.setSize = function(sx, sy) {
        this.width = sx;
        this.height = sy;
        this.cx = sx / 2;
        this.cy = sy / 2;
        return this;
    }

    PH_Rect.prototype.render = function() {
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

    function PH_Circle() {
        this.radius = 0;
    }

    PH_Circle.prototype = new PH_Base();

    PH_Circle.prototype.setRadius = function(newRadius) {
        this.radius = newRadius;
        return this;
    }

    PH_Circle.prototype.render = function(deltaTime) {
        this.matrix_setup();

        (function(ctx, circle) {
            ctx.beginPath();
            ctx.arc(0, 0, circle.radius, 0, 2 * Math.PI);
            ctx.fillStyle = circle.fillStyle;
            ctx.fill();
            ctx.lineWidth = circle.lineWidth;
            ctx.strokeStyle = circle.strokeStyle;
            ctx.stroke();
        })(engine.context, this);

        return this;
    }

    function Placeholders() {

    }

    Placeholders.prototype.rect = function(sx, sy) {
        var r = new PH_Rect();
        r.setSize(sx, sy);
        return r;
    }

    Placeholders.prototype.circle = function(initRadius) {
        var circle = new PH_Circle();
        circle.setRadius(initRadius);
        return circle;
    }

    function CollisionShapes() {}

    CollisionShapes.prototype.rect = function(halfWidth, halfHeight) {
        return new CollisionRect(halfWidth, halfHeight);
    }

    CollisionShapes.prototype.circle = function(radius) {
        return new CollisionCircle(radius);
    }

    function Tween(target, duration, params) {
        this.done = false;
        this.target = target;
        this.duration = duration;
        this.func = function(v0, v1, t) {
            return v0 + (v1 - v0) * t;
        };

        this.targetParams = params;

        this._originalParams = {};

        for (var p in params) {
            this._originalParams[p] = target[p];
        }

        this._timePassed = 0;

        // Events
        this.onfinished = null;
    }

    Tween.prototype.update = function(deltaTime) {
        var t = (this._timePassed / this.duration);
        if (t > 1) {
            this.done = true;
            if (typeof this.onfinished === "function") {
                this.onfinished.call(this.target);
            }
        } else {
            for (p in this._originalParams) {
                this.target[p] = this.func(this._originalParams[p], this.targetParams[p], t);
            }
            this._timePassed += deltaTime;
        }
    }

    Tween.prototype.finished = function(callback) {
        this.onfinished = callback;
        return this;
    }

    /**
     * Core Engine unit
     */
    function Engine() {
        this.canvas = null;
        this.children = [];
        this.context = null;
        this.debug = false;
        this.mouse = null;
        this.onready = null;
        this.onrender = null;
        this.placeholders = new Placeholders();
        this.resources = new ResourceManager();
        this.screenHeight = 0;
        this.screenWidth = 0;
        this.tweens = [];

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

    Engine.prototype.tween = function(target, duration, params) {
        var newTween = new Tween(target, duration, params);
        this.tweens.push(newTween);
        return newTween;
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
        return this;
    }

    Engine.prototype.render = function(callback) {
        this.onrender = callback;
        return this;
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

                if (typeof engine.onrender === "function") {
                    engine.onrender.call(engine, engine.context);
                }

                for (var i_tween = engine.tweens.length - 1; i_tween >= 0; i_tween--) {
                    engine.tweens[i_tween].update(deltaTime);
                    if (engine.tweens[i_tween].done) {
                        engine.tweens.splice(i_tween, 1);
                    }
                };

                for (var i = 0; i < engine.children.length; i++) {
                    engine.children[i].doUpdate(deltaTime);
                };

                for (var i = 0; i < engine.children.length; i++) {
                    engine.children[i].render();
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

    Engine.prototype.sound = function(soundID) {
        if (typeof this.resources.res[soundID] != "undefined") {
            return this.resources.res[soundID];
        } else {
            console.log('sound not found:', soundID);
        }
    }

    window["engine"] = new Engine();
})(window);