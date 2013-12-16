

(function () {

exports.checkSupport = function() {
    if (!('localStorage' in window)) {
        return false;
    }
    return true;
}

var n10b =    '0123456789';
var n100b =   repeat(n10b, 10);
var n1kib =   repeat(n100b, 10);
var n10kib =  repeat(n1kib, 10);
var n100kib = repeat(n10kib, 10);
var n1mib =   repeat(n100kib, 10);
var n10mib =  repeat(n1mib, 10);

var values = [];

var iterationsData = [];
var index = 0;
var oldLength = 0;

function init() {
    values = [n10b, n100b, n1kib, n10kib, n100kib, n1mib, n10mib];
    iterationsData = [];
    for (var majorIndex = 1; majorIndex < values.length; majorIndex++) {
        var major = values[majorIndex];
        var minor = values[majorIndex - 1];
        for (var i = 1; i < 10; i++) {
            for (var j = 0; j < 10; j++) {
                iterationsData.push([major, minor, i, j]);
            }
        }
    }
    
    index = 0;
    oldLength = 0;
}


function iteration(callback) {
    var data = iterationsData[index];

    major = data[0];
    minor = data[1];
    i = data[2];
    j = data[3];

    var string = repeat(major, i) + repeat(minor, j);
    var length = '' + string.length;

    // everything worked
    if (test(string)) {
        callback(length, 0, false);
    } 
    // some worked
    else {
        callback(oldLength, length, false);
        stopCount();
        return;
    }
    oldLength = length;

    index++;
    if (index < iterationsData.length) {
        setTimeout(function() {
            iteration(callback);
        }, 0);
    } else {
        // test was stopped
        callback(oldLength, 0, true);
        stopCount();
    }
}
exports.start = function (callback) {
    init();
    iteration(callback);
};

function stopCount(){
    iterationsData=[];
    localStorage.removeItem('test');
}
exports.stopCouch = stopCount;

function test(value) {
    try {
        localStorage.test = value;
        return true;
    } catch (e) {
        return false;
    }
}

function repeat(string, count) {
    var array = [];
    while (count--) {
        array.push(string);
    }
    return array.join('');
}

})();