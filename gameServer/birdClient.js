// enforce strict/clean programming
"use strict";

function BirdClient() {
	var socket;
	var lastUpdateAt = 0;
	var myId;
	var birds = {};
	var map;
	var screenX = 0;

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
				// console.log(message);
				switch (message.type) {
					case "connect":
						if (message.isMyself) {
							myId = message.id;
							renderer.setPlayer(message.id);
						}
						var bird = new Bird();
						bird.init(message.id);
						birds[message.id] = bird;

						renderer.createBird(message.id, bird.x, bird.y);
						break;
					case "update":
						var t = message.timestamp;
						if (t < lastUpdateAt)
							break;
						lastUpdateAt = t;

						// update player
						screenX = message.screen_x;
						var birdsUpdate = message.birds;
						var index;
						for (index in birdsUpdate) {
							var bird = birdsUpdate[index];
							birds[bird.id].setBirdPosition({
								x: bird.x - screenX,
								y: bird.y
							});
						}

						render();
						break;
					case "start":
						startGame();

						sendToServer({
							type: "start"
						})

						break;
					case "end":
						console.log(message);
						endGame(message.loser, message.distance);
						break;
					case "new_tube":
						var tubes = message.tubes;
						var id;
						for (id in tubes) {
							var covertedTube = {
								x: tubes[id].x - screenX,
								y: tubes[id].y,
								w: tubes[id].w,
								h: tubes[id].h
							};
							renderer.addTube(covertedTube);
						}
						break;
					case "restart":
						restartGame();
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
	var render = function() {
		var id;
		for (id in birds) {
			renderer.updateBird(id, {
				x: birds[id].x,
				y: birds[id].y
			});
		}

	}

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
	var endGame = function(loserid, distance) {
		console.log(myId, loserid);
		if (myId != loserid) {
			renderer.endGame(true, distance);
		} else {
			renderer.endGame(false, distance);
		}
	}

	var restartGame = function() {
		renderer.init();
		var id;
		for (id in birds) {
			birds[id] = new Bird();
			birds[id].init(id);
		}
		screenX = 0;
	}

	/*
	 * priviledge method: start
	 *
	 * Create the ball and paddles objects, connects to
	 * server, draws the GUI, and starts the rendering
	 * loop.
	 */
	this.start = function() {
		map = new Map();
		//initialize game
		initGUI();
		// Initialize network and GUI
		initNetwork();

	}
}

var gameClient = new BirdClient();
var renderer = new Render();
setTimeout(function() {
	gameClient.start();
}, 500);