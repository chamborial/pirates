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


    // Make sure all the required images are loaded before game start
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
    this.height = 0
    this.collision = false;
    this.type = "";

   this.isCollidableWith = function(object) {
    return (this.collidableWith === object.type);
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

            // Start QuadTree
            this.quadTree = new QuadTree({x:0,y:0,width:this.gameCanvas.width,height:this.gameCanvas.height});

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
    // Insert objects into quadtree
    game.quadTree.clear();
    game.quadTree.insert(game.ship);
    game.quadTree.insert(game.ship.ballPool.getPool());
    game.quadTree.insert(game.enemyBulletPool.getPool());
    detectCollision();

    // Update the game state for each of the objects
    game.background.draw();
    game.enemies.draw();
    game.ship.move();
    game.ship.ballPool.animate();
    game.enemyBulletPool.animate();
    //game.enemies.eBallPool.animate();
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

function doVictoryFrame() {
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


function detectCollision() {
    var objects = [];
    game.quadTree.getAllObjects(objects);
    for (var x = 0, len = objects.length; x < len; x++) {
        game.quadTree.findObjects(obj = [], objects[x]);

        for (y = 0, length = obj.length; y < length; y++) {

            // DETECT COLLISION ALGORITHM
            if (objects[x].collidableWith === obj[y].type &&
                (objects[x].x < obj[y].x + obj[y].width &&
                 objects[x].x + objects[x].width > obj[y].x &&
                 objects[x].y < obj[y].y + obj[y].height &&
                 objects[x].y + objects[x].height > obj[y].y)) {
                objects[x].isColliding = true;
                obj[y].isColliding = true;
            }
        }
    }
};


/**
 * QuadTree object.
 *
 * The quadrant indexes are numbered as below:
 *     |
 *  1  |  0
 * —-+—-
 *  2  |  3
 *     |
 */
function QuadTree(boundBox, lvl) {
    var maxObjects = 10;
    this.bounds = boundBox || {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };
    var objects = [];
    this.nodes = [];
    var level = lvl || 0;
    var maxLevels = 5;
    /*
     * Clears the quadTree and all nodes of objects
     */
    this.clear = function() {
        objects = [];
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].clear();
        }
        this.nodes = [];
    };
    /*
     * Get all objects in the quadTree
     */
    this.getAllObjects = function(returnedObjects) {
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].getAllObjects(returnedObjects);
        }
        for (var i = 0, len = objects.length; i < len; i++) {
            returnedObjects.push(objects[i]);
        }
        return returnedObjects;
    };
    /*
     * Return all objects that the object could collide with
     */
    this.findObjects = function(returnedObjects, obj) {
        if (typeof obj === "undefined") {
            console.log("UNDEFINED OBJECT");
            return;
        }
        var index = this.getIndex(obj);
        if (index != -1 && this.nodes.length) {
            this.nodes[index].findObjects(returnedObjects, obj);
        }
        for (var i = 0, len = objects.length; i < len; i++) {
            returnedObjects.push(objects[i]);
        }
        return returnedObjects;
    };
    /*
     * Insert the object into the quadTree. If the tree
     * excedes the capacity, it will split and add all
     * objects to their corresponding nodes.
     */
    this.insert = function(obj) {
        if (typeof obj === "undefined") {
            return;
        }
        if (obj instanceof Array) {
            for (var i = 0, len = obj.length; i < len; i++) {
                this.insert(obj[i]);
            }
            return;
        }
        if (this.nodes.length) {
            var index = this.getIndex(obj);
            // Only add the object to a subnode if it can fit completely
            // within one
            if (index != -1) {
                this.nodes[index].insert(obj);
                return;
            }
        }
        objects.push(obj);
        // Prevent infinite splitting
        if (objects.length > maxObjects && level < maxLevels) {
            if (this.nodes[0] == null) {
                this.split();
            }
            var i = 0;
            while (i < objects.length) {
                var index = this.getIndex(objects[i]);
                if (index != -1) {
                    this.nodes[index].insert((objects.splice(i,1))[0]);
                }
                else {
                    i++;
                }
            }
        }
    };
    /*
     * Determine which node the object belongs to. -1 means
     * object cannot completely fit within a node and is part
     * of the current node
     */
    this.getIndex = function(obj) {
        var index = -1;
        var verticalMidpoint = this.bounds.x + this.bounds.width / 2;
        var horizontalMidpoint = this.bounds.y + this.bounds.height / 2;
        // Object can fit completely within the top quadrant
        var topQuadrant = (obj.y < horizontalMidpoint && obj.y + obj.height < horizontalMidpoint);
        // Object can fit completely within the bottom quandrant
        var bottomQuadrant = (obj.y > horizontalMidpoint);
        // Object can fit completely within the left quadrants
        if (obj.x < verticalMidpoint &&
                obj.x + obj.width < verticalMidpoint) {
            if (topQuadrant) {
                index = 1;
            }
            else if (bottomQuadrant) {
                index = 2;
            }
        }
        // Object can fix completely within the right quandrants
        else if (obj.x > verticalMidpoint) {
            if (topQuadrant) {
                index = 0;
            }
            else if (bottomQuadrant) {
                index = 3;
            }
        }
        return index;
    };
    /*
     * Splits the node into 4 subnodes
     */
    this.split = function() {
        // Bitwise or [html5rocks]
        var subWidth = (this.bounds.width / 2) | 0;
        var subHeight = (this.bounds.height / 2) | 0;
        this.nodes[0] = new QuadTree({
            x: this.bounds.x + subWidth,
            y: this.bounds.y,
            width: subWidth,
            height: subHeight
        }, level+1);
        this.nodes[1] = new QuadTree({
            x: this.bounds.x,
            y: this.bounds.y,
            width: subWidth,
            height: subHeight
        }, level+1);
        this.nodes[2] = new QuadTree({
            x: this.bounds.x,
            y: this.bounds.y + subHeight,
            width: subWidth,
            height: subHeight
        }, level+1);
        this.nodes[3] = new QuadTree({
            x: this.bounds.x + subWidth,
            y: this.bounds.y + subHeight,
            width: subWidth,
            height: subHeight
        }, level+1);
    };
}