"use strict";

function Render() {
	var stage, width, height, bird_red, bird_blue, ground,loader, manifest, hill, hill2, tubes;
	var isStarted = true;

	this.init = function() {
		// setup main stage
		stage = new createjs.Stage("gameStage");
		// grab canvas width and height
		width = stage.canvas.width;
		height = stage.canvas.height;

		manifest = [
			{src: "red-bird-sprite-sheet.png", id: "bird_blue"},
			{src: "blue-bird-sprite-sheet.png", id: "bird_red"},
			{src: "ground.png", id: "ground"},
			{src: "hill1.png", id: "hill"},
			{src: "hill2.png", id: "hill2"},
		];
		loader = new createjs.LoadQueue(false);
		loader.addEventListener("complete", handleComplete);
		loader.loadManifest(manifest, true, "Assets/");

	}

	this.startGame = function() {
		isStarted = true;
	}

	var handleComplete = function() {

		createBird();
		createBackGround();

		// start to tick
		createjs.Ticker.addEventListener("tick", handleTick);
	}

	var createBird = function() {

		var spriteSheet = new createjs.SpriteSheet({
			images: [loader.getResult("bird_red")],
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
		bird_red = new createjs.Sprite(spriteSheet, "fly");
		bird_red.x = 10;
		bird_red.y = 10;

		var spriteSheet = new createjs.SpriteSheet({
			images: [loader.getResult("bird_blue")],
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
		bird_blue = new createjs.Sprite(spriteSheet, "fly");
		bird_blue.x = 100;
		bird_blue.y = 100;

		stage.addChild(bird_red);
		stage.addChild(bird_blue);
	}

	var createBackGround = function() {
		var groundImg = loader.getResult("ground");
		ground = new createjs.Shape();
		ground.graphics.beginBitmapFill(groundImg).drawRect(0, 0, width + groundImg.width, groundImg.height);
		ground.tileW = groundImg.width;
		ground.y = height - groundImg.height;

		hill = new createjs.Bitmap(loader.getResult("hill"));
		hill.setTransform(Math.random() * width, height - hill.image.height * 4 - groundImg.height, 4, 4);
		hill.alpha = 0.5;

		hill2 = new createjs.Bitmap(loader.getResult("hill2"));
		hill2.setTransform(Math.random() *width, height - hill2.image.height * 3 - groundImg.height, 3, 3);
		stage.addChild(ground, hill, hill2);
	}

	var handleTick = function(event) {
		var deltaS = event.delta / 1000;

		// if the game is started, start to move the background objects
		if (isStarted) {
			ground.x = (ground.x - deltaS * 150) % ground.tileW;

			hill.x = (hill.x - deltaS * 30);
			if (hill.x + hill.image.width * hill.scaleX <= 0) {
				hill.x = width;
			}
			hill2.x = (hill2.x - deltaS * 45);
			if (hill2.x + hill2.image.width * hill2.scaleX <= 0) {
				hill2.x = width;
			}

		}
		

		stage.update(event);
	}

	this.updateBird = function() {

	}

	this.addTube = function(tube) {

	}
}

global.Render = Render;
var render = new Render();
render.init();