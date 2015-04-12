// enforce strict/clean programming
"use strict";

function BirdClient() {
	var socket;
	var lastUpdateAt = 0;
	var myId;
	var birds = {};


	var sendToServer = function(msg) {
		var date = new Date();
		var currentTime = date.getTime();
		msg["timestamp"] = currentTime;
		socket.send(JSON.stringify(msg));
	}

	/*
	 * private method: initNetwork(msg)
	 *
	 * Connects to the server and initialize the various
	 * callbacks.
	 */
	var initNetwork = function() {
		// Attempts to connect to game server
		try {
			socket = new SockJS("http://" + Config.SERVER_NAME + ":" + Config.WEBPORT + "/bird");
			socket.onmessage = function(e) {
				var message = JSON.parse(e.data);
				switch (message.type) {
					case "connect":
						if (message.isMyself) {
							myId = message.id;
						}
						var bird = new Bird();
						birds[message.id] = bird;
						break;
					case "update":
						var t = message.timestamp;
						if (t < lastUpdateAt)
							break;
						lastUpdateAt = t;

						// update player
						console.log("update player");

						var birdsUpdate = message.birds;
						var index;
						for (index in birdsUpdate) {
							var bird = birdsUpdate[index];
							birds[bird.id].setBirdPosition({
								x: bird.x,
								y: bird.y
							});
						}
						render();
						break;
					case "start":
						startGame();
						break;
					case "end":
						endGame(message.winner, message.distance);
						break;
					default:
						console.log("unhandle type:" + message.type);
				}
			}
		} catch (e) {
			console.log("Failed to connect to " + "http://" + Sockick.SERVER_NAME + ":" + Sockick.PORT);
		}
	}

	/*
	 * private method: initGUI
	 *
	 * Initialize a play area and add events.
	 */
	var initGUI = function() {
		renderer.init();
	}

	/*
	 * private method: render
	 *
	 * Draw the play area.  Called periodically at a rate
	 * equals to the frame rate.
	 */
	var render = function() {}

	/**
	 * private method: startGame
	 *
	 * start running the game
	 */
	var startGame = function() {
		renderer.startGame();
	}

	/**
	 * private method: endGame
	 * 
	 * @param  int winnerid id of the winner
	 * @param  int distance distance flied
	 */
	var endGame = function(winnerid, distance) {
		if (myId === winnerid) {
			renderer.endGame(true, distance);
		}
		else {
			renderer.endGame(false, distance);
		}
	}
	/*
	 * priviledge method: start
	 *
	 * Create the ball and paddles objects, connects to
	 * server, draws the GUI, and starts the rendering
	 * loop.
	 */
	this.start = function() {
		//initialize game

		// Initialize network and GUI
		initNetwork();
		initGUI();
	}
}

var gameClient = new BirdClient();
var renderer = new Render();
setTimeout(function() {
	gameClient.start();
}, 500);