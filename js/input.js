//Key codes to be mapped
KEY_CODES = Object.freeze({
        13: 'enter'
        , 32: 'space'
        , 37: 'left'
        , 38: 'up'
        , 39: 'right'
        , 40: 'down'
        , 80: 'p'
    });
    // Array to hold all key codes & sets all values to false
KEY_STATUS = {};
for (code in KEY_CODES) {
    KEY_STATUS[KEY_CODES[code]] = false;
}
document.addEventListener('keydown', function (e) {
    console.log(e.keyCode)
        // var keyCode = (e.charCode) ? e.charCode : e.charCode;
    if (KEY_CODES[e.keyCode]) {
        e.preventDefault();
        KEY_STATUS[KEY_CODES[e.keyCode]] = true;
    }
});
document.addEventListener('keyup', function (e) {
    console.log(e.keyCode)
        // var keyCode = (e.charCode) ? e.charCode : e.charCode;
    if (KEY_CODES[e.keyCode]) {
        e.preventDefault();
        KEY_STATUS[KEY_CODES[e.keyCode]] = false;
    }
});
