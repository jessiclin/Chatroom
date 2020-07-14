let element = function(id){
    return document.getElementById(id);
}

// Get elements 
let cred = sessionStorage.getItem('cred');
let messages = element('messages');
let textarea = element('textarea');
let all_chats = element('all-chats');
let logout = element('logout');
let send = element('send');
let group = [];
let users = [];
let username = '';

// Set default status (empty)
let statusDefault = status.textContent;

let setStatus = function(s){
    // Set status 
    status.textContent = s;

    // Set status to default after 4 seconds
    if (s != statusDefault){
        let delay = setTimeout(function(){
            setStatus(statusDefault);
        }, 4000);
    }
}

// Connect to socket.io   
let socket = io.connect('http://localhost:4000');

// Check for connection
if (socket !== undefined){
    console.log('Connected to socket');

    // Get username 
    socket.emit("get-user", cred);

    // Handle getting username 
    socket.on('username', function(data){
        username = data;    
    });

    //socket.emit("get-chats");
    socket.emit("get-chats", cred);

        // Handle getting chats
        socket.on('chats', function(data){
            if (data.length){
    
                // Add buttons 
                for(var x = 0; x < data.length; x++){
                    let users = data[x].users;
    
                    let chat = document.createElement('button');
        
                    chat.style.textAlign = 'center';
                    chat.setAttribute('class', 'chat-btn');
                    chat.setAttribute("id", "chat-button");
        
                    chat.textContent = users[0];
        
                    for (var y = 1; y < users.length; y++){
                        chat.textContent = chat.textContent + ', ' + users[y];
                    }
                    
                    all_chats.appendChild(chat);
                    all_chats.insertBefore(all_chats.lastChild, chat);
                }
    
    
                // Add event listeners 
                for (let x = 1; x < all_chats.childNodes.length; x++){
      
                    if (all_chats.childNodes[x].id === "chat-button"){
                     all_chats.childNodes[x].addEventListener('click', function(){
                         //socket.emit('clear');
                         var child = messages.lastElementChild;  
                         while (child) { 
                             messages.removeChild(child); 
                             child = messages.lastElementChild; 
                         } 
                         users = data[x-1].users;
                         group = data[x-1].group;
                         socket.emit('get-messages', {group: group, users : users});
                     });
                     }
                  }
            }

            // Handle output 
            socket.on('output', function(data){
                if(data.length){
                    for(let x = 0; x < data.length; x++){
                        // Build out message div 
                        let messageDiv = document.createElement('div');
                        messageDiv.setAttribute('class', 'message');
                        let insName = document.createElement('p');
                        insName.setAttribute('class', 'meta')
                        insName.setAttribute('id', 'msg-sender');
                        let message = document.createElement('p');
                        message.setAttribute('class', 'text');
                        if (data[x].email ===  cred){
                            message.style.textAlign = "right";
                            message.textContent = data[x].message;
                        }
                        else{
                            message.style.textAlign = "left";
                            insName.textContent = data[x].from;
                            message.textContent = data[x].message;

                        }
                        
                        messageDiv.appendChild(insName);
                        messageDiv.insertBefore(messageDiv.lastChild, insName);
                        messageDiv.appendChild(message);
                        messageDiv.insertBefore(messageDiv.lastChild, message);
                        messages.appendChild(messageDiv);
                        // Most recent chat on top 
                        messages.insertBefore(messages.lastChild, messageDiv);
                    }
                }

                if (document.getElementById('msg-sender') !== null)
                    console.log(messages.lastChild.getAttribute('class'));
            });

            // Handle input 
            send.addEventListener('click', function(){
                // Emit to server input
                socket.emit('input', {from : username, email: cred, group: group, users: users, message: textarea.value});
                textarea.value = "";
                event.preventDefault();
            });
            textarea.addEventListener('keydown', function(event){
                // keycode 13 is Return/Enter
                if(event.which === 13 && event.shiftKey === false){
                    // Emit to server input
                    socket.emit('input', {from : username, email: cred, group: group, users: users, message: textarea.value});
                    textarea.value = "";
                    event.preventDefault();
                }
            });

            // Handle logout
            logout.addEventListener('click', function(){
                sessionStorage.clear();
                location.replace('../html/login.html');
            });

            // Get status from server 
            socket.on('status', function(data){
                // Get message status 
                setStatus((typeof data === 'object') ? data.message : data);

                // If status is clear, clear text 
                if (data.clear){
                    textarea.value = '';
                }
            });
        });
}