"use strict";

function Render() {
	var stage, width, height, ground, loader, manifest, hill, hill2;
	var birds = {};
	var tubes = [];
	var winningSign;
	var playerSign;
	var isStarted = false;

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
		}, {
			src: "tube.png",
			id: "tube"
		}];
		loader = new createjs.LoadQueue(false);
		loader.addEventListener("complete", handleComplete);
		loader.loadManifest(manifest, true, "Assets/");

	}

	this.startGame = function() {
		isStarted = true;

		var index;
		for (index in birds) {
			birds[index].gotoAndPlay("fly");
		}

		stage.removeChild(winningSign);
		stage.removeChild(playerSign);
	}

	this.endGame = function(isWinner, distance) {
		isStarted = false;

		var index;
		for (index in birds) {
			birds[index].gotoAndPlay("stay");
		}

		if (isWinner) {
			winningSign.Text = "You Win!!";
		} else {
			winningSign.Text = "You Lose..."
		}
		stage.addChild(winningSign);
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

		winningSign = new createjs.Text("", "20px Arial", "#ff7700");
		winningSign.x = 500;
		winningSign.y = 200;
		winningSign.textBaseline = "alphabetic";

		playerSign = new createjs.Text("", "20px Arial", "#ff7700");
		playerSign.x = 500;
		playerSign.y = 200;
		playerSign.textBaseline = "alphabetic";
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
			var index;
			for (index in tubes) {
				if (tubes[index].x + Config.TUBE_WIDTH < -1000) {
					stage.removeChild(tubes[index]);
					tubes.splice(index, 1);;
				} else {
					tubes[index].x = tubes[index].x - deltaS * 150;
				}
			}

		}


		stage.update(event);
	}

	this.updateBird = function(id, position) {
		birds[id].x = position.x;
		birds[id].y = position.y;
	}

	this.addTube = function(tube) {
		var tubeShape = new createjs.Shape();
		tubeShape.graphics.beginFill("green").drawRect(tube.x, tube.y, tube.w, tube.h);

		tubes.push(tubeShape);
		stage.addChild(tubeShape);
	}

	this.setPlayer = function(id) {
		playerSign.Text = "You are player " + id;
		stage.addChild(playerSign);
	}
}

global.Render = Render;