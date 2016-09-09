// Create an object which will hold all of our graphics so we only have to load them once
var images = new function() {
    // Create image objects
    this.background     = new Image();
    this.playerShip     = new Image();
    this.enemyShip      = new Image();
    this.enemyDuck      = new Image();
    this.enemyRock      = new Image();
    this.enemyCraig     = new Image();
    this.craigWarning   = new Image();
    this.explosion      = new Image();

    // Map our image objects to files
    this.background.src     = "img/kenneyGraphics/PNG/rpgTile029.png";
    this.playerShip.src     = "img/kenneyGraphics/PNG/pship.png";
    this.enemyShip.src      = "img/kenneyGraphics/PNG/enemyship.png";
    this.enemyDuck.src      = "img/kenneyGraphics/PNG/duck_yellow.png";
    this.enemyRock.src      = "img/kenneyGraphics/PNG/spaceMeteors_001.png";
    this.enemyCraig.src     = "img/kenneyGraphics/PNG/craigship.png";
    this.craigWarning.src   = "img/kenneyGraphics/PNG/craigWarning2.png";
    this.explosion.src      = "img/kenneyGraphics/PNG/explosion07.png";
}

function Enemies(maxEnemies) {
    var maxEnemies;
    var enemies = [];

    this.init = function() {
        for (var i = 0; i < maxEnemies; i++) {
            var enemy = new Enemy();
            enemy.init(0, 0, 0, 0, ENEMY_TYPE.DEAD, 0);
            enemies[i] = enemy;
        }
    }

    this.draw = function() {
        for (var i = 0; i < maxEnemies; i++) {
            if (enemies[i].enemy_type != ENEMY_TYPE.DEAD) {
                enemies[i].draw();
                if (enemies[i].enemy_state == ENEMY_STATE.DEAD) {
                    enemies[i].clean();
                    enemies.push((enemies.splice(i,1))[0]);
                }
            }
        }
    }

    this.spawn = function(x, y, enemyType, speed) {
        if (enemies[maxEnemies-1].enemy_type == ENEMY_TYPE.DEAD) {
            //TODO: MAKE THIS WORK
        }
    }
}

// The base drawable object which all objects with graphics will inherit.
// Contains an X and Y location, as well as a "draw" function.
function Drawable() {
    // Initialise the object with a specified X and Y coordinate
    this.init = function(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.imageWidth = width;
        this.imageHeight = height;
    }
    // The speed at which the object is moving.
    this.speed = 0;
    // Initialise the width and height of the canvas to 0. This will be overwritten before it is used.
    this.canvasWidth = 0;
    this.canvasHeight = 0;
    this.imageWidth = 0;
    this.imageHeight = 0

    this.draw = function() {
        // An abstract function which will be implemented by child objects
    };
}

function Background() {
    this.speed = 1;
    this.counter = 0;
    this.draw = function() {
        // Move the image by [speed] pixels to the left each time it is drawn
        // If the whole image scrolls off the left of the screen, reset the X coordinate
        // Tile the background image vertically and horizontally
        for (var x = this.x; x < this.canvasWidth; x += images.background.width) {
            for (var y = this.y; y < this.canvasHeight; y += images.background.height) {
                this.context.drawImage(images.background, x, y, images.background.width, images.background.height);
            }
        }
        if (this.x <= -this.imageWidth) {
            this.x = 0
        }
        this.x -= this.speed;
        this.y = 10*Math.sin(this.counter/30) - 10;
        this.counter += 1;
    }
}
Background.prototype = new Drawable();

function PlayerShip() {
    this.draw = function() {
        this.context.drawImage(images.playerShip, this.x, this.y, this.imageWidth, this.imageHeight)
    }
}
PlayerShip.prototype = new Drawable();

function Game() {
    this.init = function() {
        this.bgCanvas   = document.getElementById('canvas-background');
        this.gameCanvas = document.getElementById('canvas-game');
        // Check if the canvas is supported
        if (this.bgCanvas.getContext) {
            // Get the canvas context
            this.bgContext      = this.bgCanvas.getContext('2d');
            this.gameContext    = this.gameCanvas.getContext('2d');

            // Assign the context to each of the objects
            Background.prototype.context        = this.bgContext;
            Background.prototype.canvasWidth    = this.bgCanvas.width;
            Background.prototype.canvasHeight   = this.bgCanvas.height;
            PlayerShip.prototype.context        = this.bgContext;
            PlayerShip.prototype.canvasWidth    = this.bgCanvas.width;
            PlayerShip.prototype.canvasHeight   = this.bgCanvas.height;
            Enemy.prototype.context             = this.gameContext;
            Enemy.prototype.canvasWidth         = this.gameCanvas.width;
            Enemy.prototype.canvasHeight        = this.gameCanvas.height;

            this.background = new Background();
            this.background.init(0, 0, 64, 64);
            this.enemies = new Enemies(8);
            this.enemies.init();
            return true;
        } else {
            return false;
        }
    }
    this.start = function() {
        doFrame();
    }
}

function doFrame() {
    requestAnimFrame( doFrame );
    game.background.draw();
    game.enemies.draw();
}

/**
 * requestAnim shim layer by Paul Irish
 * Finds the first API that works to optimize the animation loop,
 * otherwise defaults to setTimeout().
 */
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame   ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function(/* function */ callback, /* DOMElement */ element){
				window.setTimeout(callback, 1000 / 60);
			};
})();

var game = new Game();

function init() {
    if(game.init()) {
        game.start();
    }
}
