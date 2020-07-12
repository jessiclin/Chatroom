let element = function(id){
    return document.getElementById(id);
}

let frstName = element('first-name');
let lstName = element('last-name');
let email = element('email');
let username = element('username');
let password = element('password');
let confPassword = element('conf-password');
let createBtn = element('new-account');
let acctCred = element('account-cred');
let errList = [];

// Connect to socket.io   
let socket = io.connect('http://localhost:4000');

// Check for connection
if (socket !== undefined){
    console.log('Connected to socket');

    createBtn.addEventListener('click', function(){
        while (errList.length > 0){
            acctCred.removeChild(errList.pop());
        }
        if (frstName.value === ''){
            let frstNameError = document.createElement('div');
            frstNameError.setAttribute('id', 'error-frstName');
            frstNameError.style.color = 'red';
            frstNameError.textContent = 'Enter First Name';
            acctCred.appendChild(frstNameError);
            acctCred.insertBefore(frstNameError, frstName);
            errList.push(frstNameError);
        }
        if (lstName.value === ''){
            let lstNameError = document.createElement('div');
            lstNameError.setAttribute('id', 'error-lstName');
            lstNameError.style.color = 'red';
            lstNameError.textContent = 'Enter Last Name';
            acctCred.appendChild(lstNameError);
            acctCred.insertBefore(lstNameError, lstName);
            errList.push(lstNameError);
        }
        if (email.value === ''){
            let emailError = document.createElement('div');
            emailError.setAttribute('id', 'error-email');
            emailError.style.color = 'red';
            emailError.textContent = 'Enter Email';
            acctCred.appendChild(emailError);
            acctCred.insertBefore(emailError, email);
            errList.push(emailError);
        }
        if (username.value === ''){
            let usernameError = document.createElement('div');
            usernameError.setAttribute('id', 'error-username');
            usernameError.style.color = 'red';
            usernameError.textContent = 'Enter username';
            acctCred.appendChild(usernameError);
            acctCred.insertBefore(usernameError, username);
            errList.push(usernameError);
        }
        if (password.value === '' || password.value !== confPassword.value){
            let passwordError = document.createElement('div');
            passwordError.setAttribute('id', 'error-password');
            passwordError.style.color = 'red';
            if (password.value === ''){
                passwordError.textContent = 'Enter Password';
                acctCred.appendChild(passwordError);
                acctCred.insertBefore(passwordError, password);
            }
            else{
                passwordError.textContent = 'Passwords do not match';
                acctCred.appendChild(passwordError);
                acctCred.insertBefore(passwordError, confPassword);
            }
            errList.push(passwordError);
        }

        // Create a new account 
        if (errList.length == 0){
            socket.emit('new-acct', {email: email.value, first: frstName.value, last: lstName.value, user: username.value, pass : password.value });
        }

        socket.on('unsuccessful', function(){
            let emailError = document.createElement('div');
            emailError.setAttribute('id', 'error-email');
            emailError.style.color = 'red';
            emailError.textContent = 'Email in use';
            acctCred.appendChild(emailError);
            acctCred.insertBefore(emailError, email);
            errList.push(emailError);
        });

        // Listen for successful creation of account 
        socket.on('output', function(data){
            sessionStorage.setItem('cred', data);
            location.replace("chatroom.html");
        });

        socket.on('status', function(data){
            // get message status
            setStatus((typeof data === 'object')? data.message : data);

            // If status is clear, clear text
            if(data.clear){
                frstName.textContent = '';
                lstName.textContent = '';
                email.textContent = '';
                username.textContent = '';
                password.textContent = '';
                confPassword.textContent = '';
            }
        });
    });
}