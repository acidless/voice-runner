navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

if (navigator.getUserMedia) {

} else {
    console.log("getUserMedia not supported");
}