"use strict";

function Bird() {
	this.x;
	this.y;
	this.width = Config.BIRD_FRAME_WIDTH;
	this.height = Config.BIRD_FRAME_HEIGHT;
	this.velocity = 0;

	this.setBirdPosition = function(position) {

	}

	this.getBirdPosition = function() {

	}

	this.birdFlap = function() {
		this.velocity = Config.FLAP_VELOCITY;
	}

	this.updatePositiion = function(t) {
		this.x += Config.FORWARD_VELOCITY * t;
		var dy = this.velocity * t + 0.5 * Config.ACCELERATION * t * t;
		this.y += dy;
		this.velocity += Config.ACCELERATION * t;
	}
}

global.Bird = Bird;