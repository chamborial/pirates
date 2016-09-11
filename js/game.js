var GAME_STATE = Object.freeze({    TITLE:      0,
                                    PLAYING:    1,
                                    PAUSED:     2,
                                    GAME_OVER:  3,
                                    VICTORY:    4});

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
    this.victory        = new Image();


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
    this.background.onload      = imgloaded;
    this.playerShip.onload      = imgloaded;
    this.enemyShip.onload       = imgloaded;
    this.enemyDuck.onload       = imgloaded;
    this.enemyRock.onload       = imgloaded;
    this.enemyCraig.onload      = imgloaded;
    this.craigWarning.onload    = imgloaded;
    this.explosion.onload       = imgloaded;
    this.cball.onload           = imgloaded;
    this.eball.onload           = imgloaded;
    this.paused.onload          = imgloaded;
    this.logo.onload            = imgloaded;
    this.gameOver.onload        = imgloaded;
    this.victory.onload         = imgloaded;

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
    this.victory.src        = "img/victory.png";
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
        this.lives = 3;
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
            
            // Clear each canvas so that the game starts with fresh canvases
            this.bgContext.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height)
            this.playerContext.clearRect(0, 0, this.playerCanvas.width, this.playerCanvas.height)
            this.gameContext.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height)
            this.hudContext.clearRect(0, 0, this.hudCanvas.width, this.hudCanvas.height)
            
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

            this.ship.init(100, 310, 233,
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
                break;
            case GAME_STATE.VICTORY:
                this.hudContext.clearRect(0, 0, 1080, 720);
                this.hudContext.drawImage(images.victory, (1080 - images.victory.width)/2, (720 - images.victory.height)/2, images.victory.width, images.victory.height);
                break;
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
                this.enemies.spawn(1340, 95, ENEMY_TYPE.DUCK, 2, 2);
                this.enemies.spawn(1340, 335, ENEMY_TYPE.DUCK, 2, 2);
                this.enemies.spawn(1340, 575, ENEMY_TYPE.DUCK, 2, 2);
                this.enemies.spawn(1260, 215, ENEMY_TYPE.DUCK, 2, 2);
                this.enemies.spawn(1260, 455, ENEMY_TYPE.DUCK, 2, 2);
                this.enemies.spawn(1180, 335, ENEMY_TYPE.DUCK, 2, 2);
                break;
            case 1:
                // Spawn the enemies for the second wave
                this.enemies.spawn(1180, 335, ENEMY_TYPE.SHIP, 2, 4);
                this.enemies.spawn(1340, 95, ENEMY_TYPE.SHIP, 2, 4);
                this.enemies.spawn(1340, 575, ENEMY_TYPE.SHIP, 2, 4);
                break;
            case 2:
                // Spawn the enemies for the third wave
                this.enemies.spawn(1180, 335, ENEMY_TYPE.SHIP, 3, 4);
                this.enemies.spawn(1340, 95, ENEMY_TYPE.SHIP, 3, 4);
                this.enemies.spawn(1340, 575, ENEMY_TYPE.SHIP, 3, 4);
                this.enemies.spawn(1500, 95, ENEMY_TYPE.ROCK, 2, 10000);
                this.enemies.spawn(1700, 575, ENEMY_TYPE.ROCK, 2, 10000);
                this.enemies.spawn(1600, 340, ENEMY_TYPE.ROCK, 2, 10000);
                this.enemies.spawn(1750, 225, ENEMY_TYPE.ROCK, 2, 10000);
                this.enemies.spawn(1800, 655, ENEMY_TYPE.ROCK, 2, 10000);
                break;
            case 3:
                // Spawn the enemies for the final wave
                this.bossApproachTimer = 450;
                this.enemies.spawn(1080, 252, ENEMY_TYPE.CRAIG, 2, 50);
                break;
            case 4:
                // Show the victory screen!
                this.state = GAME_STATE.VICTORY;
            default:
        }
        console.log("Spawned wave ", this.wave);
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
        case GAME_STATE.VICTORY:
            doVictoryFrame();
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
    enemyHit();
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
    if(game.lives <= 0){
        game.state = GAME_STATE.GAME_OVER;
    }
    game.ship.invincibilityTimer = game.ship.invincibilityTimer - 1;
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
        game.init();
    }
}

function doVictoryFrame() {
    game.background.draw();
    game.drawHud();
    if (KEY_STATUS.enter) {
        game.init();
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
    // Check collision between the player and bullets
    for (var i = 0; i < game.enemyBulletPool.size; i++) {
        var bullet = game.enemyBulletPool.pool[i];
        if (bullet.isInUse) {
            if (testCollision(game.ship.x, game.ship.y, PLAYER_WIDTH, PLAYER_HEIGHT, bullet.x + BULLET_WIDTH/2, bullet.y + BULLET_HEIGHT/2)) {
                if (game.ship.invincibilityTimer <= 0) {
                    bullet.context.clearRect(bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT);
                    game.lives = game.lives - 1;
                    game.ship.invincibilityTimer = 150;
                    // Destroy bullets that hit you
                    bullet.clear();
                    game.enemyBulletPool.pool.push((game.enemyBulletPool.pool.splice(i, 1))[0]);
                }
            }
        } else {
            // As unused bullets are kept together at the end of the pool, we can stop once we find the first one
            break;
        }
    }
    // Check collision between the player and enemies
    for (var i = 0; i < game.enemies.maxEnemies; i++) {
        var enemy = game.enemies.enemies[i];
        if (enemy.enemyType != ENEMY_TYPE.NONE){
            if (testCollision(game.ship.x, game.ship.y, PLAYER_WIDTH, PLAYER_HEIGHT, enemy.x + enemy.width/2, enemy.y + enemy.height/2)) {
                if (game.ship.invincibilityTimer <= 0) {
                    enemy.context.clearRect(enemy.x, enemy.y, enemy.width, enemy.height);
                    game.lives = game.lives - 1;
                    game.ship.invincibilityTimer = 150;
                    // Kill the enemy when you crash into them!
                    enemy.state = ENEMY_STATE.DYING;
                    enemy.timer = 0;
                }
            }
        } else {
            // As unused enemies are kept together at the end of the pool, we can stop once we find the first one
            break;
        }
    }
};

function enemyHit() {
    for (var i = 0; i < game.enemies.maxEnemies; i++) {
        var enemy = game.enemies.enemies[i];
        // Don't do collision with unused enemies
        if ((enemy.enemyType != ENEMY_TYPE.NONE)) {
            // Don't do collision with dying enemies
            if (enemy.state != ENEMY_STATE.DYING) {
                for (var j = 0; j < game.ship.ballPool.size; j++) {
                    var bullet = game.ship.ballPool.pool[j];
                    if (bullet.isInUse) {
                        if (testCollision(enemy.x, enemy.y, enemy.width, enemy.height, bullet.x, bullet.y)) {
                            enemy.hp = enemy.hp - 1;
                            if (enemy.hp <= 0) {
                                // Kill the enemy when their HP reaches 0
                                enemy.state = ENEMY_STATE.DYING;
                                enemy.timer = 0;
                            }
                            // Clear out the bullet graphic
                            bullet.context.clearRect(bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT);
                            bullet.clear();
                            game.ship.ballPool.pool.push((game.ship.ballPool.pool.splice(j, 1))[0]);
                        }
                    } else {
                        // As unused bullets are kept together at the end of the pool, we can stop once we find the first one
                        break;
                    }
                }
            }
        } else {
            // As unused enemies are kept together at the end of the pool, we can stop once we find the first one
            break;
        }
    }
}

function testCollision(objectX, objectY, objectWidth, objectHeight, ballX, ballY)
{
    //x1, y1 = x and y coordinates of object 1
    //w1, h1 = width and height of object 1
    //x2, y2 = x and y coordinates of object 2 (usually midpt)
    if ((objectX <= ballX && objectX+objectWidth >= ballX) &&
        (objectY <= ballY && objectY+objectHeight >= ballY))
            return true;
    else
        return false;
};