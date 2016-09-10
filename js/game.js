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
    this.cball          = new Image();


   // Make sure all the required images are loaded before game start
   // This fixes a known pre IE10 bug where init would be called before images had loaded
   var imgCount = 9;
   var imgLoaded = 0;

   function imgloaded(){
       imgLoaded++;
       if (imgLoaded === imgCount){
           window.init(); // All images are loaded
       }
   }
   // Have the images call the imgloaded function when they finish loading
   this.background.onload = imgloaded;
   this.playerShip.onload = imgloaded;
   this.enemyShip.onload = imgloaded;
   this.enemyDuck.onload = imgloaded;
   this.enemyRock.onload = imgloaded;
   this.enemyCraig.onload = imgloaded;
   this.craigWarning.onload = imgloaded;
   this.explosion.onload = imgloaded;
   this.cball.onload = imgloaded;

    // Map our image objects to files
    this.background.src     = "img/waterTile.png";
    this.playerShip.src     = "img/pship.png";
    this.enemyShip.src      = "img/enemyship.png";
    this.enemyDuck.src      = "img/duck.png";
    this.enemyRock.src      = "img/rock.png";
    this.enemyCraig.src     = "img/craigship.png";
    this.craigWarning.src   = "img/craigWarning.png";
    this.explosion.src      = "img/explosion.png";
    this.cball.src          = "img/cannonBall.png";
}

// The base drawable object which all objects with graphics will inherit.
// Contains an X and Y location, as well as a "draw" function.
function Drawable() {
    // Initialise the object with a specified X and Y coordinate
    this.init = function(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    // The speed at which the object is moving.
    this.speed = 0;
    // Initialise the width and height of the canvas to 0. This will be overwritten before it is used.
    this.canvasWidth = 0;
    this.canvasHeight = 0;
    this.width = 0;
    this.height = 0

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

/*function PlayerShip() {
    this.draw = function() {
        this.context.drawImage(images.playerShip, this.x, this.y, this.imageWidth, this.imageHeight)
    }
}
PlayerShip.prototype = new Drawable();*/

function Game() {
    this.init = function() {
        this.bgCanvas   = document.getElementById('canvas-background');
        this.gameCanvas = document.getElementById('canvas-game');
        this.playerCanvas = document.getElementById('canvas-player');
        
        // Check if the canvas is supported
        if (this.bgCanvas.getContext) {
            // Get the canvas context
            this.bgContext      = this.bgCanvas.getContext('2d');
            this.playerContext = this.playerCanvas.getContext('2d');
            this.gameContext    = this.gameCanvas.getContext('2d');

            // Assign the context to each of the objects
            Background.prototype.context        = this.bgContext;
            Background.prototype.canvasWidth    = this.bgCanvas.width;
            Background.prototype.canvasHeight   = this.bgCanvas.height;
            Ship.prototype.context              = this.playerContext;
            Ship.prototype.canvasWidth          = this.playerCanvas.width;
            Ship.prototype.canvasHeight         = this.playerCanvas.height;
            Enemy.prototype.context             = this.gameContext;
            Enemy.prototype.canvasWidth         = this.gameCanvas.width;
            Enemy.prototype.canvasHeight        = this.gameCanvas.height;
            Cball.prototype.context             = this.gameContext;
            Cball.prototype.canvasHeight        = this.gameCanvas.height;
            Cball.prototype.canvasWidth         = this.gameCanvas.width;

            this.background = new Background();
            this.background.init(0, 0, 64, 64);
            this.enemies = new Enemies(8);
            this.enemies.init();
            
            this.ship = new Ship();
            
            // Start ship at bottom of canvas
     /*       var shipStartX = this.playerCanvas.width/2 - images.playerShip.width;
			var shipStartY = this.playerCanvas.height/4*3 + images.playerShip.height*2;*/
            
		/*	this.ship.init(shipStartX, shipStartY, images.playerShip.width,
			               images.playerShip.height);*/
            
            this.ship.init(20, 20, 20,
			               20);
            
            return true;
        } else {
            return false;
        }
    }
    this.start = function() {
        this.ship.draw();
        doFrame();
    }
}

function doFrame() {
    requestAnimFrame( doFrame );
    game.background.draw();
    game.enemies.draw();
    game.ship.move();
    game.ship.ballPool.animate();
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
