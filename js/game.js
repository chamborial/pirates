var GAME_STATE = Object.freeze({    TITLE:      0,
                                    PLAYING:    1,
                                    PAUSED:     2,
                                    GAME_OVER:  3});

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
    this.eball          = new Image();
    this.paused         = new Image();
    this.logo           = new Image();
    this.gameOver       = new Image();


    // Make sure all the required images are loaded before game star
    // This fixes a known pre IE10 bug where init would be called before images had loaded
    var imgCount = 13;
    var imgLoaded = 0;

    function imgloaded(){
        imgLoaded++;
        if (imgLoaded === imgCount){
            window.init(); // All images are loaded
        }
    }
    // Have the images call the imgloaded function when they finish loading
    this.background.onload   = imgloaded;
    this.playerShip.onload   = imgloaded;
    this.enemyShip.onload    = imgloaded;
    this.enemyDuck.onload    = imgloaded;
    this.enemyRock.onload    = imgloaded;
    this.enemyCraig.onload   = imgloaded;
    this.craigWarning.onload = imgloaded;
    this.explosion.onload    = imgloaded;
    this.cball.onload        = imgloaded;
    this.eball.onload        = imgloaded;
    this.paused.onload       = imgloaded;
    this.logo.onload         = imgloaded;
    this.gameOver.onload     = imgloaded;

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
    this.eball.src          = "img/enemyBall.png";
    this.paused.src         = "img/paused.png";
    this.logo.src           = "img/skullAndCrossbones.png";
    this.gameOver.src       = "img/gameOver.png";
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
    this.height = 0;

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

function Game() {
    this.init = function() {
        // Get the 3 canvases
        this.wave = 0;
        this.state = GAME_STATE.TITLE;
        this.globalTimer = 0;
        this.pauseDelay = 0;
        this.bossApproachTimer = 0;
        this.bgCanvas       = document.getElementById('canvas-background');
        this.gameCanvas     = document.getElementById('canvas-game');
        this.playerCanvas   = document.getElementById('canvas-player');
        this.hudCanvas      = document.getElementById('canvas-hud');

        // Check if the canvas is supported
        if (this.bgCanvas.getContext) {
            // Get the canvas contexts
            this.bgContext      = this.bgCanvas.getContext('2d');
            this.playerContext  = this.playerCanvas.getContext('2d');
            this.gameContext    = this.gameCanvas.getContext('2d');
            this.hudContext     = this.hudCanvas.getContext('2d');

            // Assign the correct context to each of the objects
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

            // Initialise the objects which will always be present
            this.background = new Background();
            this.background.init(0, 0, 64, 64);
            this.enemies = new Enemies(8);
            this.enemies.init();

            this.ship = new Ship();

            // Start ship at bottom of canvas
     /*       var shipStartX = this.playerCanvas.width/2 - images.playerShip.width;
            var shipStartY = this.playerCanvas.height/4*3 + images.playerShip.height*2;*/

            /*this.ship.init(shipStartX, shipStartY, images.playerShip.width,
                           images.playerShip.height);*/

            this.ship.init(20, 20, 233,
                           100);

            this.enemyBulletPool = new Pool(50);
            this.enemyBulletPool.init("eball");

            return true;
        } else {
            return false;
        }
    };

    this.drawHud = function() {
        switch (this.state) {
            case GAME_STATE.TITLE:
                if (this.globalTimer === 0) {
                    console.log("Drawing logo");
                    this.hudContext.drawImage(images.logo, (1080 - images.logo.width)/2, (720 - images.logo.height)/2, images.logo.width, images.logo.height);
                    //this.hudContext.drawImage(images.logo, 440, 260, 200, 200);
                }
                break;
            case GAME_STATE.PLAYING:
                if (this.bossApproachTimer > 1) {
                    if (this.bossApproachTimer % 120 === 0) {
                        this.hudContext.drawImage(images.craigWarning, 0, 260, 1080, 200);
                    } else if (this.bossApproachTimer % 120 === 60) {
                        this.hudContext.clearRect(0, 260, 1080, 200);
                    }
                    this.bossApproachTimer -= 1;
                }
                break;
            case GAME_STATE.PAUSED:
                if (this.globalTimer % 20 === 0) {
                    this.hudContext.drawImage(images.paused, 452, 560, 175, 60);
                } else if (this.globalTimer % 20 === 10) {
                    this.hudContext.clearRect(452, 560, 175, 60);
                }
                break;
            case GAME_STATE.GAME_OVER:
                this.hudContext.clearRect(0, 0, 1080, 720);
                this.hudContext.drawImage(images.gameOver, (1080 - images.gameOver.width)/2, (720 - images.gameOver.height)/2, images.gameOver.width, images.gameOver.height);
            default:
        }
    }

    this.clearHud = function () {
        this.hudContext.clearRect(0,0,1080,720);
    }

    this.start = function() {
        // Draw the ship for the first frame, as otherwise it is only drawn when it moves.
        doFrame();
    }

    this.nextWave = function() {
        // Spawn the wave, then increment the wave counter.
        switch (this.wave++) {
            case 0:
                // Spawn the enemies for the first wave
                this.enemies.spawn(1340, 95, ENEMY_TYPE.DUCK, 2);
                this.enemies.spawn(1340, 335, ENEMY_TYPE.DUCK, 2);
                this.enemies.spawn(1340, 575, ENEMY_TYPE.DUCK, 2);
                this.enemies.spawn(1260, 215, ENEMY_TYPE.DUCK, 2);
                this.enemies.spawn(1260, 455, ENEMY_TYPE.DUCK, 2);
                this.enemies.spawn(1180, 335, ENEMY_TYPE.DUCK, 2);
                break;
            case 1:
                // Spawn the enemies for the second wave
                this.enemies.spawn(1180, 335, ENEMY_TYPE.SHIP, 2);
                this.enemies.spawn(1340, 95, ENEMY_TYPE.SHIP, 2);
                this.enemies.spawn(1340, 575, ENEMY_TYPE.SHIP, 2);
                break;
            case 2:
                // Spawn the enemies for the third wave
                this.enemies.spawn(1180, 335, ENEMY_TYPE.SHIP, 3);
                this.enemies.spawn(1340, 95, ENEMY_TYPE.SHIP, 3);
                this.enemies.spawn(1340, 575, ENEMY_TYPE.SHIP, 3);
                this.enemies.spawn(1500, 95, ENEMY_TYPE.ROCK, 2);
                this.enemies.spawn(1700, 575, ENEMY_TYPE.ROCK, 2);
                this.enemies.spawn(1600, 340, ENEMY_TYPE.ROCK, 2);
                this.enemies.spawn(1750, 225, ENEMY_TYPE.ROCK, 2);
                this.enemies.spawn(1800, 655, ENEMY_TYPE.ROCK, 2);
                break;
            case 3:
                // Spawn the enemies for the final wave
                this.bossApproachTimer = 450;
                this.enemies.spawn(1080, 252, ENEMY_TYPE.CRAIG, 2);
                break;
            default:
        }
        console.log("Spawned wave ", this.wave);
    }

    this.lives = 3;
    if(this.lives <= 0){
        alert("dead");
        console.log(this.lives);
    }

}

function doFrame() {
    requestAnimFrame( doFrame );
    switch (game.state) {
        case GAME_STATE.TITLE:
            doTitleFrame();
            break;
        case GAME_STATE.PLAYING:
            doGameFrame();
            break;
        case GAME_STATE.PAUSED:
            doPausedFrame();
            break;
        case GAME_STATE.GAME_OVER:
            doGameOverFrame();
            break;
        default:
    }
    game.globalTimer = game.globalTimer + 1;
}

function doTitleFrame() {
    game.background.draw();
    game.drawHud();
    if (KEY_STATUS.enter) {
        game.clearHud();
        game.ship.draw();
        game.state = GAME_STATE.PLAYING;
    }
}

function doGameFrame() {
    // Update the game state for each of the objects
    game.background.draw();
    game.enemies.draw();
    game.ship.move();
    game.ship.ballPool.animate();
    game.enemyBulletPool.animate();
    playerHit();
    game.drawHud();
    // Begin the next wave if the last one has been cleared
    if (game.enemies.areAllDead()) {
        game.nextWave()
    }

    // Pause the game if the player hits P
    if (game.pauseDelay <= 0) {
        if (KEY_STATUS.p) {
            game.state = GAME_STATE.PAUSED;
            game.pauseDelay = 30;
        }
    } else {
        game.pauseDelay = game.pauseDelay - 1;
    }
}

function doPausedFrame() {
    game.drawHud()
    // Unpause the game if the player hits P
    if (game.pauseDelay <= 0) {
        if (KEY_STATUS.p) {
            game.state = GAME_STATE.PLAYING;
            game.pauseDelay = 10;
            game.hudContext.clearRect(452, 560, 175, 60);
        }
    } else {
        game.pauseDelay = game.pauseDelay - 1;
    }
}

function doGameOverFrame() {
    game.background.draw();
    game.drawHud();
    if (KEY_STATUS.enter) {
        if(game.init()) {
            game.start();
        }
    }
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

function playerHit() {
    if (testCollision(
        game.ship.x, game.ship.y, PLAYER_WIDTH, PLAYER_HEIGHT, game.enemyBulletPool.x, game.enemyBulletPool.y))
    {
        this.lives = this.lives - 1;
      //  boxArray.splice(i, 1);
    }           
};

function testCollision(playerX, playerY, playerWidth, playerHeight, ballX, ballY)
{
    //x1, y1 = x and y coordinates of object 1
    //w1, h1 = width and height of object 1
    //x2, y2 = x and y coordinates of object 2 (usually midpt)
    if ((playerX <= ballX && playerX+playerWidth >= ballX) &&
        (playerY <= ballY && playerY+playerHeight >= ballY))
            return true;
    else
        return false;
};