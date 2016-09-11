// Player settings
const PLAYER_WIDTH = 140
const PLAYER_HEIGHT = 80
const PLAYER_FIRE_RATE = 15
const BULLET_WIDTH = 10
const BULLET_HEIGHT = 10

    // Pool object - reuses old objects instead of creating & deleting new ones. (Reduces lag)
function Pool(maxsize) {
    var size = maxsize; // The maximum number of bullets allowed
    var pool = [];

    this.init = function(object) {
        if (object == "cball") {
            for (var i = 0; i < size; i++) {
                // Initalize the object
                var cball = new Cball("cball");
                cball.init(0,0, images.cball.width, images.cball.height);
                pool[i] = cball;
            }
        }
        else if (object == "eball") {
            for (var i = 0; i < size; i++) {
                var cball = new Cball("eball");
                cball.init(0,0, images.eball.width, images.eball.height);
                pool[i] = cball;
            }
        }
    };




    // this.init = function () {
    //     for (var i = 0; i < size; i++) {
    //         // Initalize cannon ball
    //         var cball = new Cball();
    //         cball.init(0, 0, images.cball.width, images.cball.height);
    //         pool[i] = cball;
    //     }
    // };
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

function Cball(Object) {
    this.isInUse = false; // The bullet is not in use as it has just been created
    this.self = Object;

    this.spawn = function (x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.isInUse = true;
    };
    // Use 'dirty rectangle' technique to clear only the area around the bullet
    this.draw = function () {
        this.context.clearRect(this.x, this.y, BULLET_WIDTH, BULLET_HEIGHT);
        this.x += this.speed;
        // If bullet moves of the screen - return true
        // if (this.x <= 0 - this.width) {
        //     return true; // Bullet ready to be cleared by pool
        // }
        // else {
        //     this.context.drawImage(images.cball, this.x, this.y); // Draw the bullet
        // }

        if (this.self === "cball" && this.x <= 0 - this.width) {
            return true;
        }
        else if (this.self === "eball" && this.x >= this.canvasWidth) {
            return true;
        }
        else {
            if (this.self === "cball") {
                this.context.drawImage(images.cball, this.x, this.y, BULLET_HEIGHT, BULLET_WIDTH);
            }
            else if (this.self === "eball") {
                this.context.drawImage(images.eball, this.x, this.y, BULLET_HEIGHT, BULLET_WIDTH);
            }
            return false;
        }
    };



// if (this.isColliding) {
//             return true;
//         }
//         else if (self === "cball" && this.y <= 0 - this.height) {
//             return true;
//         }
//         else {
//             if (self === "cball") {
//                 this.context.drawImage(imageRepository.cball, this.x, this.y);
//             }
//             return false;
//         }



   // };
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
    this.ballPool = new Pool(15);
    this.ballPool.init("cball");
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

            // Moves the player in various directions by altering the x & y values in correspondence with the speed
            // The nested if statements ensures that the player cannot move off the screen
            if (KEY_STATUS.left) {
                this.x -= this.speed
                if (this.x <= 0)
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
        if (KEY_STATUS.space && counter >= PLAYER_FIRE_RATE) {
            this.fire();
            counter = 0;
        }
    };
    // FIRE!!!!!!!!!!!
    this.fire = function () {
        this.ballPool.getBall(this.x+PLAYER_WIDTH - BULLET_WIDTH/2, this.y+PLAYER_HEIGHT/2 - BULLET_HEIGHT/2, 4);
    };
}
Ship.prototype = new Drawable();
