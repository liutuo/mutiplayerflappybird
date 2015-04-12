"use strict";

function Map() {
	var tubeQueue = [];
	this.playerScreenStartX = 0;
	this.bird

	this.generateNewTubePair = function(startX) {
		var r1 = Math.random();
		var r2 = Math.random();
		var h1 = Math.round((Config.CANVAS_HEIGHT - Config.MIN_GAP) * r1 / (r1 + r2));
		var h2 = Math.round((Config.CANVAS_HEIGHT - Config.MIN_GAP) * r2 / (r1 + r2));

		var d = Math.round(Math.random() * Config.TUBE_WIDTH);
		var tubeup = {
			x: startX,
			y: 0,
			w: Config.TUBE_WIDTH,
			h: h1
		};
		var tubedown = {
			x: d + startX,
			y: Config.CANVAS_HEIGHT - Config.GROUND_HEIGHT - h2,
			w: Config.TUBE_WIDTH,
			h: h2
		};
		tubeQueue.push(tubeup);
		tubeQueue.push(tubedown);
		return [tubeup, tubedown];
	}

	this.addNewTube = function(tube) {
		tubeQueue.push(tube);
	}

	this.getNearestTubePair = function() {
		return [tubeQueue[0], tubeQueue[1]];
	}

	this.deleteTube = function() {
		tubeQueue.shift();
		tubeQueue.shift();
	}

	this.getTubeQueue = function() {
		return tubeQueue;
	}
}

global.Map = Map;