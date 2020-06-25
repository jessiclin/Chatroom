var element = function(id){
    return document.getElementById(id);
}

var username = element('username');
var password = element('password');
var loginBtn = element('login');

// Connect to socket.io   
var socket = io.connect('http://localhost:4000');

// Check for connection
if (socket !== undefined){
    console.log('Connected to socket');

    // Handle login 
    loginBtn.addEventListener('click', function(){
        socket.emit('login', {username: username.value, password: password.value});
    });

    // Handle successful login 
    socket.on('success', function(){
        location.replace("chatroom.html");
    });
}