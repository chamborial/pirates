// Pool object - reuses old objects instead of creating & deleting new ones. (Reduces lag)
function Pool(maxsize) {
    var size = maxsize; // The maximum number of bullets allowed
    var pool = [];
    this.init = function () {
        for (var i = 0; i < size; i++) {
            // Init cannon ball
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
            else break;
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
        this.y -= this.speed;
        // If bullet moves of the screen - return true
        if (this.y <= 0 - this.height) {
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
    this.speed = 3;
    this.ballPool = new Pool(30);
    this.ballPool.init();
    var rate = 15;
    var counter = 0;
    this.draw = function () {
        this.context.drawImage(images.playerShip, this.x, this.y);
    };
    this.move = function () {
        counter++;
        // Capture keys related to movement
        if (KEY_STATUS.left || KEY_STATUS.right || KEY_STATUS.down || KEY_STATUS.up) {
            // Erase current image as movement has been requested
            this.context.clearRect(this.x, this.y, this.width, this.height);
            switch (KEY_STATUS) {
            case KEY_STATUS.left:
                this.x -= this.speed
                if (this.x <= 0) // Ensure player is within the screen
                    this.x = 0
                break;
            case KEY_STATUS.right:
                this.x += this.speed
                if (this.x >= this.canvasWidth - this.width) this.x = this.canvasWidth - this.width;
                break;
            case KEY_STATUS.up:
                this.y -= this.speed
                if (this.y <= this.canvasHeight / 4 * 3) this.y = this.canvasHeight / 4 * 3;
                break;
            case KEY_STATUS.down:
                    this.y += this.speed
                    if (this.y >= this.canvasHeight - this.height)
                        this.y = this.canvasHeight - this.height;
                break;
            }
            // Re draw the player ship
            this.draw();
        }
        
        // If space call fire
        if (KEY_STATUS.space && counter >= rate){
            this.fire();
            counter = 0;
        }
    };
    
    // FIRE!!!!!!!!!!!
    this.fire = function(){
        this.ballpool.getBall(this.x+6,this.y,3);
    };

}
Ship.prototype = new Drawable();

//Key codes to be mapped
KEY_CODES = {
    32: 'space',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
}


// Array to hold all key codes & sets all values to false
KEY_STATUS = {};
for (code in KEY_CODES){
    KEY_STATUS[KEY_CODES[code]] = false;
}

document.addEventListener('keydown', function(e) {
     console.log(e.keyCode)
     // var keyCode = (e.charCode) ? e.charCode : e.charCode;
    if (KEY_CODES[e.keyCode]){
        e.preventDefault();
        KEY_STATUS[KEY_CODES[e.keyCode]] = true;
    }
});

document.addEventListener('keyup', function(e) {
     console.log(e.keyCode)
     // var keyCode = (e.charCode) ? e.charCode : e.charCode;
    if (KEY_CODES[e.keyCode]){
        e.preventDefault();
        KEY_STATUS[KEY_CODES[e.keyCode]] = false;
    }
});




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
