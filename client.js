var element = function(id){
    return document.getElementById(id);
}

// Get elements 
var status = element('status');
var username = sessionStorage.getItem('user');
var messages = element('messages');
var textarea = element('textarea');
var clearBtn = element('clear');
var all_chats = element('all-chats');
var group = [];

// Set default status (empty)
var statusDefault = status.textContent;

var setStatus = function(s){
    // Set status 
    status.textContent = s;

    // Set status to default after 4 seconds
    if (s != statusDefault){
        var delay = setTimeout(function(){
            setStatus(statusDefault);
        }, 4000);
    }
}

// Connect to socket.io   
var socket = io.connect('http://localhost:4000');

// Check for connection
if (socket !== undefined){
    console.log('Connected to socket');

    //socket.emit("get-chats");
    socket.emit("get-chats", username);

    // Handle getting chats
    socket.on('chats', function(data){
        console.log(data);
        if (data.length){
            for (var x = 0; x < data.length; x++){
                var chat = document.createElement('button');

                chat.style.textAlign = "center";
                //chat.textContent = data[x].users;
                chat.textContent = data[x].group[0];
                for (var y = 1; y < data[x].group.length; y++){
                    //if (data[x].users[y] !== username){
                    chat.textContent = chat.textContent + ", " +  data[x].group[y] ;
                    //}
                }
                //console.log(data[x].users);
                all_chats.appendChild(chat);
                all_chats.insertBefore(all_chats.lastChild, chat);

                chat.addEventListener('click', function(){
                    group = chat.textContent.split(", ");
                    socket.emit('get-messages', group);
                });
            }
        }
    });

    // Handle output 
    socket.on('output', function(data){
        //console.log(data);
        if(data.length){
            for(var x = 0; x < data.length; x++){
                // Build out message div 
                var message = document.createElement('div');

                if (data[x].sender === username){
                    message.style.textAlign = "right";
                    message.setAttribute('class', 'chat-message');
                    message.textContent = data[x].message;
                }
                else{
                    message.style.textAlign = "left";
                    message.setAttribute('class', 'chat-message');
                    message.textContent = data[x].sender + ': ' + data[x].message;
                }
                

                messages.appendChild(message);
                // Most recent chat on top 
                messages.insertBefore(messages.lastChild, message)
            }
        }
    });
    
    // Handle input 
    textarea.addEventListener('keydown', function(event){
        // keycode 13 is Return/Enter
        if(event.which === 13 && event.shiftKey === false){
            // Emit to server input
            socket.emit('input', {sender: username, group: group, message: textarea.value});
            textarea.value = "";
            event.preventDefault();
        }
    });

    // Handle clearing the chat 
    clearBtn.addEventListener('click', function(){
        // Emit to clear event 
        socket.emit('clear', group);
    });

    // Clear messages 
    socket.on('cleared', function(){
        messages.textContent = '';
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
}