"use strict";

function Render() {
	var stage, width, height, ground, loader, manifest, hill, hill2;
	var birds = {};
	var tubes = [];
	var isStarted = true;

	this.init = function() {
		// setup main stage
		stage = new createjs.Stage("gameStage");
		// grab canvas width and height
		width = stage.canvas.width;
		height = stage.canvas.height;

		manifest = [{
			src: "red-bird-sprite-sheet.png",
			id: "bird_blue"
		}, {
			src: "blue-bird-sprite-sheet.png",
			id: "bird_red"
		}, {
			src: "ground.png",
			id: "ground"
		}, {
			src: "hill1.png",
			id: "hill"
		}, {
			src: "hill2.png",
			id: "hill2"
		}, ];
		loader = new createjs.LoadQueue(false);
		loader.addEventListener("complete", handleComplete);
		loader.loadManifest(manifest, true, "Assets/");

	}

	this.startGame = function() {
		isStarted = true;
	}

	var handleComplete = function() {

		createBackGround();

		// start to tick
		createjs.Ticker.addEventListener("tick", handleTick);
	}

	this.createBird = function(bid) {

		var birdImage;
		if (bid % 2 == 0)
			birdImage = "bird_red";
		else
			birdImage = "bird_blue";

		var spriteSheet = new createjs.SpriteSheet({
			images: [loader.getResult(birdImage)],
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
		birds[bid] = new createjs.Sprite(spriteSheet, "fly");
		birds[bid].x = 10;
		birds[bid].y = 10;

		stage.addChild(birds[bid]);
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
		hill2.setTransform(Math.random() * width, height - hill2.image.height * 3 - groundImg.height, 3, 3);
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
			var id;
			for (id in tubes) {
				tubes[id].x = tubes[id].x - deltaS * 150;
			}

		}


		stage.update(event);
	}

	this.updateBird = function(position) {

	}

	this.addTube = function(tube) {
		var tubeShape = new createjs.Shape();
		tubeShape.graphics.beginFill("green").drawRect(tube.x, tube.y, tube.w, tube.h);

		tubes.push(tubeShape);
		stage.addChild(tubeShape);
	}
}

global.Render = Render;
var render = new Render();
render.init();