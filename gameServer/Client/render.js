"use strict";

function Render() {
	this.stage;
	this.width;
	this.height;
	this.bird_red;
	this.bird_blue;
	this.ground;
	this.loader;
	this.isStarted = true;

	this.init = function() {
		// setup main stage
		this.stage = new createjs.Stage("gameStage");
		// grab canvas width and height
		this.width = this.stage.canvas.width;
		this.height = this.stage.canvas.height;

		this.manifest = [
			{src: "red-bird-sprite-sheet.png", id: "bird_blue"},
			{src: "blue-bird-sprite-sheet.png", id: "bird_red"},
			{src: "ground.png", id: "ground"},
			{src: "hill1.png", id: "hill"},
			{src: "hill2.png", id: "hill2"},
		];
		this.loader = new createjs.LoadQueue(false);
		this.loader.addEventListener("complete", this.handleComplete);
		this.loader.loadManifest(this.manifest, true, "Assets/");

	}

	this.startGame = function() {
		this.isStarted = true;
	}

	this.handleComplete = function() {

		render.createBird();
		render.createBackGround();

		// start to tick
		createjs.Ticker.addEventListener("tick", render.handleTick);
	}

	this.createBird = function() {

		var spriteSheet = new createjs.SpriteSheet({
			images: [render.loader.getResult("bird_red")],
			frames: {
				"width": Config.BIRD_FRAME_WIDTH,
				"height": Config.BIRD_FRAME_HEIGHT,
				"count": 8
			},
			animations: {
				fly: [0, 1, 2, 3, 4, 5, 7, 8],
				stay: 0
			}
		});
		render.bird_red = new createjs.Sprite(spriteSheet, "fly");
		render.bird_red.x = 10;
		render.bird_red.y = 10;

		var spriteSheet = new createjs.SpriteSheet({
			images: [render.loader.getResult("bird_blue")],
			frames: {
				"width": Config.BIRD_FRAME_WIDTH,
				"height": Config.BIRD_FRAME_HEIGHT,
				"count": 8
			},
			animations: {
				fly: [0, 1, 2, 3, 4, 5, 7, 8],
				stay: 0
			}
		});
		render.bird_blue = new createjs.Sprite(spriteSheet, "fly");
		render.bird_blue.x = 100;
		render.bird_blue.y = 100;

		render.stage.addChild(render.bird_red);
		render.stage.addChild(render.bird_blue);
	}

	this.createBackGround = function() {
		var groundImg = render.loader.getResult("ground");
		render.ground = new createjs.Shape();
		render.ground.graphics.beginBitmapFill(groundImg).drawRect(0, 0, render.width + groundImg.width, groundImg.height);
		render.ground.tileW = groundImg.width;
		render.ground.y = render.height - groundImg.height;

		render.hill = new createjs.Bitmap(render.loader.getResult("hill"));
		render.hill.setTransform(Math.random() * render.width, render.height - render.hill.image.height * 4 - groundImg.height, 4, 4);
		render.hill.alpha = 0.5;

		render.hill2 = new createjs.Bitmap(render.loader.getResult("hill2"));
		render.hill2.setTransform(Math.random() *render.width, render.height - render.hill2.image.height * 3 - groundImg.height, 3, 3);
		render.stage.addChild(render.ground, render.hill, render.hill2);
	}

	this.handleTick = function(event) {
		var deltaS = event.delta / 1000;

		// if the game is started, start to move the background objects
		if (render.isStarted) {
			render.ground.x = (render.ground.x - deltaS * 150) % render.ground.tileW;

			render.hill.x = (render.hill.x - deltaS * 30);
			if (render.hill.x + render.hill.image.width * render.hill.scaleX <= 0) {
				render.hill.x = render.width;
			}
			render.hill2.x = (render.hill2.x - deltaS * 45);
			if (render.hill2.x + render.hill2.image.width * render.hill2.scaleX <= 0) {
				render.hill2.x = render.width;
			}

		}
		

		render.stage.update(event);
	}

	this.updateBird = function() {

	}
}

global.Render = Render;
var render = new Render();
render.init();