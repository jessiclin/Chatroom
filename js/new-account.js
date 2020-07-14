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
            let e = errList.pop();
            e.style.border = '';
        }
        if (frstName.value === ''){
            frstName.setAttribute('style', 'border: 2px solid red;');
            errList.push(frstName);
        }
        if (lstName.value === ''){
            lstName.setAttribute('style', 'border: 2px solid red;');
            errList.push(lstName);
        }
        if (email.value === ''){
            email.setAttribute('style', 'border: 2px solid red;');
            errList.push(email);
        }
        if (username.value === ''){
            username.setAttribute('style', 'border: 2px solid red;');
            errList.push(username);
        }
        if (password.value === '' || password.value !== confPassword.value){
            password.setAttribute('style', 'border: 2px solid red;');
            // if (password.value === ''){ // Did not put password 
            //     password.setAttribute('style', 'border: 2px solid red;');
            // }
            // else{ // Passwords do not match 
            //     confPassword.setAttribute('style', 'border: 2px solid red;');
            //     errList.push(password);
            // }
            confPassword.setAttribute('style', 'border: 2px solid red;');
            errList.push(confPassword);
            errList.push(password);
            
        }

        console.log(acctCred);
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
            location.replace("../html/chat.html");
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