"use strict";

function Render() {
	var stage, width, height, ground, loader, manifest, hill, hill2;
	var birds = {};
	var tubes = [];
	var winningSign;
	var playerSign;
	var countDownLabel;
	var isStarted = false;
	var timeToStart;
	this.init = function() {
		// setup main stage
		stage = new createjs.Stage("gameStage");
		// grab canvas width and height
		width = stage.canvas.width;
		height = stage.canvas.height;

		isStarted = false;
		var birds = {};
		var tubes = [];

		manifest = [{
			src: "blue-bird-sprite-sheet.png",
			id: "bird_blue"
		}, {
			src: "red-bird-sprite-sheet.png",
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

		winningSign = new createjs.Text("", "30px Arial", "#ff7700");
		winningSign.x = 500;
		winningSign.y = 350;
		winningSign.textBaseline = "alphabetic";

		playerSign = new createjs.Text("", "30px Arial", "#ff7700");
		playerSign.x = 500;
		playerSign.y = 200;
		playerSign.textBaseline = "alphabetic";

		countDownLabel = new createjs.Text("", "30px Arial", "#ff7700");
		countDownLabel.x = 500;
		countDownLabel.y = 350;
		countDownLabel.textBaseline = "alphabetic";

		loader = new createjs.LoadQueue(false);
		loader.addEventListener("complete", handleComplete);
		loader.loadManifest(manifest, true, "Assets/");

	}

	this.startGame = function() {
		isStarted = true;
		timeToStart = 4;
		var index;
		for (index in birds) {
			birds[index].gotoAndPlay("fly");
		}

		stage.addChild(countDownLabel);
		stage.removeChild(winningSign);
		// stage.removeChild(playerSign);
	}

	this.endGame = function(isWinner, distance) {
		isStarted = false;

		var index;
		for (index in birds) {
			birds[index].gotoAndPlay("stay");
		}

		if (isWinner) {
			winningSign.text = "You Win!!";
		} else {
			winningSign.text = "You Lose..."
		}
		stage.addChild(winningSign);
	}

	var handleComplete = function() {

		createBackGround();

		// start to tick
		createjs.Ticker.addEventListener("tick", handleTick);
	}

	this.createBird = function(bid, x, y) {

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
		birds[bid].x = x;
		birds[bid].y = y;

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

		if (isStarted && timeToStart > 0) {
			timeToStart -= deltaS;
			if (Math.floor(timeToStart)) {
				countDownLabel.text = Math.floor(timeToStart);
			} else {
				countDownLabel.text = "Start!";
			}
		}

		// if the game is started, start to move the background objects
		if (isStarted && timeToStart <= 0) {
			timeToStart = 0;
			stage.removeChild(countDownLabel);
			ground.x = (ground.x - deltaS * Config.FORWARD_VELOCITY) % ground.tileW;

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
				// if (tubes[index].x + Config.TUBE_WIDTH < -1000) {
				// 	stage.removeChild(tubes[index]);
				// 	tubes.splice(index, 1);;
				// } else {
				// 	tubes[index].x = tubes[index].x - deltaS * Config.FORWARD_VELOCITY;
				// }
				tubes[index].x = tubes[index].x - createjs.Ticker.interval / 1000 * Config.FORWARD_VELOCITY;
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
		playerSign.text = "You are player " + id + ". Your bird is ";
		if (id % 2 == 0)
			playerSign.text += "red";
		else
			playerSign.text += "blue";

		stage.addChild(playerSign);
	}
}

global.Render = Render;