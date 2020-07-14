let element = function(id){
    return document.getElementById(id);
}

let email = element('email');
let password = element('password');
let loginBtn = element('login');
let login_cred = element('login-cred');
let new_acct = element('new-account');

// Connect to socket.io   
let socket = io.connect('http://localhost:4000');

// Check for connection
if (socket !== undefined){
    console.log('Connected to socket');

    // Handle login 
    loginBtn.addEventListener('click', function(){
        socket.emit('login', {email: email.value, password: password.value});
    });


    // Handle successful login 
    socket.on('login-success', function(data){
        sessionStorage.setItem('cred', data.email);

        let e = document.getElementById('error-login');
        if (e !== null){
            login_cred.removeChild(e);
        }

        location.replace("../html/chat.html");
    });

    // Handle unsuccessful login 
    socket.on('login-unsuccessful', function(){
        let error = document.createElement('div');
        error.setAttribute('id', 'error-login');
        error.textContent = "Invalid email or password";
        login_cred.appendChild(error);
        login_cred.insertBefore(error, login_cred.firstChild);
    });

    // Handle creating a new account 
    new_acct.addEventListener('click', function(){
        location.replace('../html/new-account.html');
    });
}