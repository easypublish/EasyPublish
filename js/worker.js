

// var millis = 180000;
var millis = 180000;


function checkSession() {
    postMessage(millis);
    setTimeout("checkSession()", millis);
}


function start(event){

    if (event.data) {
        millis = event.data.millis || millis;
    }
    setTimeout("checkSession()", millis);
}

onmessage = start;
