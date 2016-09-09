// Create enumerations for the different object states
const ENEMY_STATE = Object.freeze({ DEAD:           0,
                                    APPROACH:       1,
                                    MOVE_UP:        2,
                                    MOVE_DOWN:      3,
                                    STATIONARY:     4,
                                    ROCK_MOVE:      5,
                                    CRAIG_APPROACH: 10});

const ENEMY_TYPE = Object.freeze({  DUCK: 1,
                                    SHIP: 2,
                                    ROCK: 3,
                                    CRAIG: 10});

function Enemy() {
    // Set up the timer which will count up each frame and be used for 'AI' decisions.
    this.timer = 0;
    this.speed = 0;
    this.state = ENEMY_STATE.DEAD;

    this.init = function(x, y, width, height, type, speed) {
        this.x = x;
        this.y = y;
        this.imageWidth = width;
        this.imageHeight = height;
        this.enemyType = type;
        this.speed = speed;
        this.state = ENEMY_STATE.APPROACH;
    }

    // Move and draw the enemy
    this.draw = function() {
        // Draw the enemy if they're alive
        if (this.state != ENEMY_STATE.DEAD) {
        // First, clear the last drawing of the enemy
            this.context.clearRect(this.x - this.speed, this.y - this.speed, this.imageWidth + (this.speed * 2), this.imageHeight + (this.speed * 2));
            switch (this.enemyType) {
                case ENEMY_TYPE.DUCK:
                    this.context.drawImage(images.enemyDuck, this.x, this.y, this.imageWidth, this.imageHeight);
                    break;
                case ENEMY_TYPE.SHIP:
                    this.context.drawImage(images.enemyShip, this.x, this.y, this.imageWidth, this.imageHeight);
                    break;
                case ENEMY_TYPE.ROCK:
                    this.context.drawImage(images.enemyShip, this.x, this.y, this.imageWidth, this.imageHeight);
                    break;
                case ENEMY_TYPE.CRAIG:
                    this.context.clearRect(0, 260, 1080, 200);
                    this.context.drawImage(images.enemyCraig, this.x, this.y, this.imageWidth, this.imageHeight);
                    break;
            }
        }
        switch (this.state) {

            case ENEMY_STATE.APPROACH:
                if (this.enemyType == ENEMY_TYPE.CRAIG) {
                    this.state = ENEMY_STATE.CRAIG_APPROACH;
                    break;
                }
                // Move the ship onto the screen
                this.x = this.x - this.speed;
                // After 100 frames, start moving up
                if (this.timer >= 200) {
                    this.state = ENEMY_STATE.MOVE_UP;
                    // Start the enemy half-way through the move up/down cycle
                    this.timer = 50;
                }
                this.timer += 1;
                break;
            case ENEMY_STATE.MOVE_UP:
                // Move the ship up 3 pixels per frame
                this.y = this.y - this.speed;
                // After 100 frames, start moving down
                if (this.timer >= 100) {
                    this.state = ENEMY_STATE.MOVE_DOWN;
                    this.timer = 0;
                }
                this.timer += 1;
                break;
            case ENEMY_STATE.MOVE_DOWN:
                // Move the ship down 3 pixels per frame
                this.y = this.y + this.speed;
                if (this.timer >= 100) {
                    this.state = ENEMY_STATE.MOVE_UP;
                    this.timer = 0;
                }
                this.timer += 1;
                break;
            case ENEMY_STATE.CRAIG_APPROACH:
                this.x = this.x - this.speed/2;
                if (this.timer % 180 < 90) {
                    this.context.drawImage(images.craigWarning, 0, 260, 1080, 200);
                }
                if (this.timer >= 450) {
                    this.state = ENEMY_STATE.MOVE_UP;
                    this.timer = 50;
                }
                this.timer += 1;
                break;
            case ENEMY_STATE.DEAD:
                // Display an explosion graphic for 30 frames
                if (this.timer <= 30) {
                    // TODO: Display the explosion graphic
                    this.timer += 1;
                } else {
                    // TODO: Clear the explosion graphic
                }
                break;
            default:
                // If the state ends up incorrect somehow, kill the enemy.
                this.state = ENEMY_STATE.DEAD
        }

    }
}
Enemy.prototype = new Drawable();
