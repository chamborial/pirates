// Create enumerations for the different object states
const ENEMY_STATE = Object.freeze({ DEAD:           0,
                                    DYING:          1,
                                    APPROACH:       2,
                                    MOVE_UP:        3,
                                    MOVE_DOWN:      4,
                                    STATIONARY:     5,
                                    ROCK_MOVE:      6,
                                    CRAIG_APPROACH: 10});

const ENEMY_TYPE = Object.freeze({  NONE: 0,
                                    DUCK: 1,
                                    SHIP: 2,
                                    ROCK: 3,
                                    CRAIG: 10});

// Store the sizes of each enemy type
const DUCK_WIDTH    = 50;
const DUCK_HEIGHT   = 50;
const SHIP_WIDTH    = 215;
const SHIP_HEIGHT   = 100;
const ROCK_WIDTH    = 100;
const ROCK_HEIGHT   = 100;
const CRAIG_WIDTH   = 468;
const CRAIG_HEIGHT  = 225;

// function EnemyBallPool(max) {
//     var clipSize = max; // The maximum number of bullets allowed
//     var eBallPool = [];
//     this.init = function () {
//         for (var i = 0; i < clipSize; i++) {
//             // Initalize enemy ball
//             var eball = new Eball();
//             eball.init(0, 0, images.eball.width, images.eball.height);
//             eBallPool[i] = eball;
//         }
//     };
//     // Gets the last item in the list, initialises it then pushes to start of array
//     this.getEnemyBall = function (x, y, speed) {
//         if (!eBallPool[clipSize - 1].isFired) {
//             eBallPool[clipSize - 1].spawn(x, y, speed);
//             eBallPool.unshift(eBallPool.pop());
//         }
//     };
//     // When a bullet moves out of view, clear it and move it to the start of the array
//     this.animate = function () {
//         for (var i = 0; i < clipSize; i++) {
//             if (eBallPool[i].isFired) {
//                 if (eBallPool[i].draw()) {
//                     eBallPool[i].clear();
//                     eBallPool.push((eBallPool.splice(i, 1))[0]); // Splice adds new items while removing old
//                 }
//             }
//             else
//                 break;
//         }
//     };
// }

// function Eball() {
//     this.isFired = false; // The bullet is not in use as it has just been created
//     this.spawn = function (x, y, speed) {
//         this.x = x;
//         this.y = y;
//         this.speed = speed;
//         this.isFired = true;
//     };
//     // Use 'dirty rectangle' technique to clear only the area around the bullet
//     this.draw = function () {
//         this.context.clearRect(this.x, this.y, this.width, this.height);
//         this.x -= this.speed;
//         // If bullet moves of the screen - return true
//         if (this.x <= 0 - this.width) {
//             return true; // Bullet ready to be cleared by pool
//         }
//         else {
//             this.context.drawImage(images.eball, this.x, this.y); // Draw the bullet
//         }
//     };
//     //Reset
//     this.clear = function () {
//         this.x = 0;
//         this.y = 0;
//         this.speed = 0;
//         this.isFired = false;
//     };
// }
// Eball.prototype = new Drawable();

function Enemy() {
    // Set up the timer which will count up each frame and be used for 'AI' decisions.
    this.timer = 0;
    this.speed = 0;
    this.state = ENEMY_STATE.DEAD;
    this.enemyType = ENEMY_TYPE.NONE;

    // this.eBallPool = new EnemyBallPool(15);
    // this.eBallPool.init();
    // var fireRate = 15;
    // var count = 0;

    this.init = function(x, y, width, height, type, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.enemyType = type;
        this.speed = speed;
        switch (type) {
            case ENEMY_TYPE.NONE:
                this.state = ENEMY_STATE.DEAD;
                break;
            case ENEMY_TYPE.CRAIG:
                this.state = ENEMY_STATE.CRAIG_APPROACH;
                break;
            case ENEMY_TYPE.ROCK:
                this.state = ENEMY_STATE.ROCK_MOVE;
                break;
            default:
                this.state = ENEMY_STATE.APPROACH;
        }
    }

    // Move and draw the enemy
    this.draw = function() {
        // Clear the last drawing of the enemy
        this.context.clearRect(this.x - this.speed, this.y - this.speed, this.width + (this.speed * 2), this.height + (this.speed * 2));
        // Draw the enemy if they're alive
        switch (this.state) {
            case ENEMY_STATE.APPROACH:
                // Move the ship onto the screen
                this.x = this.x - this.speed;
                // After 100 frames, start moving up
                if (this.timer >= 200) {
                    // If the enemy is a duck, stop moving.
                    if (this.enemyType === ENEMY_TYPE.DUCK) {
                        //this.state = ENEMY_STATE.STATIONARY;
                        this.state = ENEMY_STATE.DYING;
                    } else {
                        //this.state = ENEMY_STATE.MOVE_UP;
                        this.state = ENEMY_STATE.DYING;
                    }
                    // Start the enemy half-way through the move up/down cycle
                    this.timer = 50;
                }
                this.timer += 1;
                break;
            case ENEMY_STATE.MOVE_UP:
                // Move the ship up (speed) pixels per frame
                this.y = this.y - this.speed;
                this.attemptToFire(0.01);
                // After 100 frames, start moving down
                if (this.timer >= 100) {
                    this.state = ENEMY_STATE.MOVE_DOWN;
                    this.timer = 0;
                }
                this.timer += 1;
                break;
            case ENEMY_STATE.MOVE_DOWN:
                // Move the ship down (speed) pixels per frame
                this.y = this.y + this.speed;
                this.attemptToFire(0.01);
                // After 100 frames, start moving up
                if (this.timer >= 100) {
                    this.state = ENEMY_STATE.MOVE_UP;
                    this.timer = 0;
                }
                this.timer += 1;
                break;
            case ENEMY_STATE.ROCK_MOVE:
                if (this.x + this.width < 0) {
                    // Kill the rock if it goes off screen
                    this.state = ENEMY_STATE.DEAD;
                    this.context.clearRect(this.x - this.speed, this.y - this.speed, this.width + (this.speed * 2), this.height + (this.speed * 2));
                }
                this.x = this.x - this.speed;
                break;
            case ENEMY_STATE.STATIONARY:
                // Be a sitting duck
                break;
            case ENEMY_STATE.CRAIG_APPROACH:
                // Move slowly onto the screen in an intimidating fashion
                this.x = this.x - this.speed/2;
                if (this.timer >= 450) {
                    this.state = ENEMY_STATE.MOVE_UP;
                    this.timer = 50;
                    break;
                }
                this.timer += 1;
                break;
            case ENEMY_STATE.DYING:
                // Display an explosion graphic for 30 frames
                if (this.timer <= 60) {
                    // TODO: Display the explosion graphic
                    this.context.drawImage(images.explosion, this.x, this.y, this.width, this.height);
                    this.timer += 1;
                } else {
                    this.context.clearRect(this.x, this.y, this.width, this.height);
                    this.state = ENEMY_STATE.DEAD;
                }
                break;
            case ENEMY_STATE.DEAD:
                this.context.clearRect(this.x, this.y, this.width, this.height);
                break;
            default:
                // If the state ends up incorrect somehow, kill the enemy.
                this.state = ENEMY_STATE.DEAD
        }
        if (this.state != ENEMY_STATE.DEAD) {
            switch (this.enemyType) {
                case ENEMY_TYPE.DUCK:
                    this.context.drawImage(images.enemyDuck, this.x, this.y, this.width, this.height);
                    break;
                case ENEMY_TYPE.SHIP:
                    this.context.drawImage(images.enemyShip, this.x, this.y, this.width, this.height);
                    break;
                case ENEMY_TYPE.ROCK:
                    this.context.drawImage(images.enemyRock, this.x, this.y, this.width, this.height);
                    break;
                case ENEMY_TYPE.CRAIG:
                    this.context.drawImage(images.enemyCraig, this.x, this.y, this.width, this.height);
                    break;
            }
        }
    };
    
    this.attemptToFire = function(chance) {
        var rand = Math.random();
        if (rand <= chance) {
            this.enemyFire();
        }
    }

    this.enemyFire = function() {
        game.enemyBulletPool.getBall(this.x - BULLET_WIDTH, this.y + this.height/2 - BULLET_HEIGHT/2, -2.5);
    }

                    //If space call fire
        // if (KEY_STATUS.space && count >= fireRate) {
        //     this.enemyFire();
        //     count = 0;
        // }
    
   // FIRE!!!!!!!!!!!
    // this.enemyFire = function () {
    //     this.eBallPool.getEnemyBall(this.x+6, this.y, 4);
    // }

    this.clean = function() {
        this.timer = 0;
        this.speed = 0;
        this.x = 0;
        this.y = 0;
        this.state = ENEMY_STATE.DEAD;
        this.enemyType = ENEMY_TYPE.NONE;
    }
}
Enemy.prototype = new Drawable();

// Keep an array of enemies so we don't have to repeatedly create new ones.
// Living enemies are at the beginning of the list, unused enemies are kept at the end.
function Enemies(maxEnemies) {
    var maxEnemies;
    var enemies = [];

    this.init = function() {
        for (var i = 0; i < maxEnemies; i++) {
            var enemy = new Enemy();
            enemy.init(0, 0, 0, 0, ENEMY_TYPE.NONE, 0);
            enemies[i] = enemy;
        }
    }

    this.draw = function() {
        // Iterate through each living enemy, calling their draw function
        for (var i = 0; i < maxEnemies; i++) {
            if (enemies[i].enemyType != ENEMY_TYPE.NONE) {
                enemies[i].draw();
                // If the draw function caused the enemy to move to the "dead" state,
                // Move the dead enemy's object to the end of the array so it can be easily found and re-used
                if (enemies[i].state === ENEMY_STATE.DEAD) {
                    enemies[i].clean();
                    enemies.push((enemies.splice(i,1))[0]);
                }
            } else {
                // Since the living enemies are all at the start of the array, we don't need to iterate through the rest.
                break;
            }
        }
    }

    this.spawn = function(x, y, enemyType, speed) {
        if (enemies[maxEnemies-1].enemyType === ENEMY_TYPE.NONE) {
            var newEnemy = enemies.pop();
            // Initialise the enemy with the correct enemy type.
            switch (enemyType) {
                case ENEMY_TYPE.DUCK:
                    newEnemy.init(x, y, DUCK_WIDTH, DUCK_HEIGHT, enemyType, speed);
                    break;
                case ENEMY_TYPE.SHIP:
                    newEnemy.init(x, y, SHIP_WIDTH, SHIP_HEIGHT, enemyType, speed);
                    break;
                case ENEMY_TYPE.ROCK:
                    newEnemy.init(x, y, ROCK_WIDTH, ROCK_HEIGHT, enemyType, speed);
                    break;
                case ENEMY_TYPE.CRAIG:
                    newEnemy.init(x, y, CRAIG_WIDTH, CRAIG_HEIGHT, enemyType, speed);
                    break;
                default:
                    // Put that thing back where it came from, or so help me!
                    // (so we don't lose things from the list)
                    enemies.push(newEnemy);
            }
            // Bring the enemy at the end of the array to the front, so it's not with the dead enemies any more.
            enemies.unshift(newEnemy);
        }
    }

    this.areAllDead = function() {
        return enemies[0].enemyType === ENEMY_TYPE.NONE;
    }

    this.getEnemies = function() {
        return enemies;
    }
}