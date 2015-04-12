"use strict";

function Bird() {
	this.x;
	this.y;
	this.width = Config.BIRD_FRAME_WIDTH;
	this.height = Config.BIRD_FRAME_HEIGHT;
	this.velocity = 0;

	this.init = function() {
		this.x = Config.BIRD_INIT_X;
		this.y = Config.BIRD_INIT_Y;
	}
	this.setBirdPosition = function(position) {
		this.x = position.x;
		this.y = position.y;
	}

	this.getBirdPosition = function() {
		return {
			x: this.x,
			y: this.y
		};
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