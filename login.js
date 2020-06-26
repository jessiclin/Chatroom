let element = function(id){
    return document.getElementById(id);
}

let username = element('username');
let password = element('password');
let loginBtn = element('login');
let login_cred = element('login-cred');

// Connect to socket.io   
let socket = io.connect('http://localhost:4000');

// Check for connection
if (socket !== undefined){
    console.log('Connected to socket');

    // Handle login 
    loginBtn.addEventListener('click', function(){
        socket.emit('login', {username: username.value, password: password.value});
    });

    // Handle successful login 
    socket.on('success', function(){
        sessionStorage.setItem('user', username.value);

        let e = document.getElementById('error-login');
        if (e !== null){
            login_cred.removeChild(e);
        }
        console.log(e);
        location.replace("chatroom.html");
    });

    // Handle unsuccessful login 
    socket.on('unsuccessful', function(){
        let error = document.createElement('div');
        error.setAttribute('id', 'error-login');
        error.textContent = "Invalid username or password";
        login_cred.appendChild(error);
    });
}