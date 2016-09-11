// Player dimensions
const PLAYER_WIDTH = 140
const PLAYER_HEIGHT = 80
    // Pool object - reuses old objects instead of creating & deleting new ones. (Reduces lag)
function Pool(maxsize) {
    var size = maxsize; // The maximum number of bullets allowed
    var pool = [];
    this.init = function () {
        for (var i = 0; i < size; i++) {
            // Initalize cannon ball
            var cball = new Cball();
            cball.init(0, 0, images.cball.width, images.cball.height);
            pool[i] = cball;
        }
    };
    // Gets the last item in the list, initialises it then pushes to start of array
    this.getBall = function (x, y, speed) {
        if (!pool[size - 1].isInUse) {
            pool[size - 1].spawn(x, y, speed);
            pool.unshift(pool.pop());
        }
    };
    // When a bullet moves out of view, clear it and move it to the start of the array
    this.animate = function () {
        for (var i = 0; i < size; i++) {
            if (pool[i].isInUse) {
                if (pool[i].draw()) {
                    pool[i].clear();
                    pool.push((pool.splice(i, 1))[0]); // Splice adds new items while removing old
                }
            }
            else
                break;
        }
    };
}

function Cball() {
    this.isInUse = false; // The bullet is not in use as it has just been created
    this.spawn = function (x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.isInUse = true;
    };
    // Use 'dirty rectangle' technique to clear only the area around the bullet
    this.draw = function () {
        this.context.clearRect(this.x, this.y, this.width, this.height);
        this.x += this.speed;
        // If bullet moves of the screen - return true
        if (this.x <= 0 - this.width) {
            return true; // Bullet ready to be cleared by pool
        }
        else {
            this.context.drawImage(images.cball, this.x, this.y); // Draw the bullet
        }
    };
    //Reset
    this.clear = function () {
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.isInUse = false;
    };
}
Cball.prototype = new Drawable();

function Ship() {
    this.speed = 5;
    this.ballPool = new Pool(30);
    this.ballPool.init();
    var rate = 15;
    var counter = 0;
    this.draw = function () {
        this.context.drawImage(images.playerShip, this.x, this.y, PLAYER_WIDTH, PLAYER_HEIGHT);
    };
    this.move = function () {
        counter++;
        // Capture keys related to movement
        if (KEY_STATUS.left || KEY_STATUS.right || KEY_STATUS.down || KEY_STATUS.up) {
            // Erase current image as movement has been requested
            this.context.clearRect(this.x, this.y, PLAYER_WIDTH, PLAYER_HEIGHT);

            // Used else if instead of switch case - as switch case allowed diagonal movement
            if (KEY_STATUS.left) {
                this.x -= this.speed
                if (this.x <= 0) // Ensure the player is within the screen
                    this.x = 0;
            }
            else if (KEY_STATUS.right) {
                this.x += this.speed
                if (this.x >= this.canvasWidth - this.width) this.x = this.canvasWidth - this.width;
            }
            else if (KEY_STATUS.up) {
                this.y -= this.speed
                if (this.y <= this.canvasHeight / this.height) this.y = this.canvasHeight / this.height;
            }
            else if (KEY_STATUS.down) {
                this.y += this.speed
                if (this.y >= this.canvasHeight - this.height) this.y = this.canvasHeight - this.height;
            }
            // Re draw the player ship
            this.draw();
        }
        // If space call fire
        if (KEY_STATUS.space && counter >= rate) {
            this.fire();
            counter = 0;
        }
    };
    // FIRE!!!!!!!!!!!
    this.fire = function () {
        this.ballPool.getBall(this.x+6, this.y, 3);
    };
}
Ship.prototype = new Drawable();
/*// Return the pressed key
// Firefox & Opera = charCode
document.onkeydown = function(e){
    alert('test');
    var keyCode = (e.charCode) ? e.charCode : e.charCode;
    if (KEY_CODES[keyCode]){
        e.preventDefault();
        KEY_STATUS[KEY_CODES[keyCode]] = true;
    }
}

// Keyup
document.onkeyup = function(e){
    var keyCode = (e.charCode) ? e.charCode : e.charCode;
    if (KEY_CODES[keyCode]){
        e.preventDefault();
        KEY_STATUS[KEY_CODES[keyCode]] = false;
    }
    */
