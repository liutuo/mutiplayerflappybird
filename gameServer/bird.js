"use strict";

function Bird() {
	this.x;
	this.y;
	this.width = Config.BIRD_FRAME_WIDTH;
	this.height = Config.BIRD_FRAME_HEIGHT;
	this.velocity = 0;

	this.init = function(id) {
		this.x = Config.BIRD_INIT_X;
		if (id % 2 == 0)
			this.y = Config.BIRD_INIT_Y;
		else
			this.y = Config.BIRD_INIT_Y + 50;
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

	this.birdFlap = function(strength) {
		switch (strength) {
			case "FAST":
			this.velocity = Config.FLAP_VELOCITY * 1.6;
			break;
			case "NORMAL":
			this.velocity = Config.FLAP_VELOCITY * 1.3;
			break;
			case "SLOW":
			this.velocity = Config.FLAP_VELOCITY;
			break;

		}
		
	}

	this.updatePositiion = function(t) {
		this.x += Config.FORWARD_VELOCITY * t;
		var dy = this.velocity * t + 0.5 * Config.ACCELERATION * t * t;
		this.y += dy;
		this.velocity += Config.ACCELERATION * t;
	}
}

global.Bird = Bird;