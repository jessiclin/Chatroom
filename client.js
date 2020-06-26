var element = function(id){
    return document.getElementById(id);
}

// Get elements 
var status = element('status');
var username = sessionStorage.getItem('name');
var messages = element('messages');
var textarea = element('textarea');
var clearBtn = element('clear');

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

    socket.emit("get-chats");

    // Handle output 
    socket.on('output', function(data){
        //console.log(data);
        if(data.length){
            for(var x = 0; x < data.length; x++){
                // Build out message div 
                var message = document.createElement('div');
                message.style.textAlign = "right";

                if (data[x].name === username){
                    message.style.textAlign = "right";
                    message.setAttribute('class', 'chat-message');
                    message.textContent = data[x].message;
                }
                else{
                    message.style.textAlign = "left";
                    message.setAttribute('class', 'chat-message');
                    message.textContent = data[x].name + ': ' + data[x].message;
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
            socket.emit('input', {name: username, message: textarea.value});
            textarea.value = "";
            event.preventDefault();
        }
    });

    // Handle clearing the chat 
    clearBtn.addEventListener('click', function(){
        // Emit to clear event 
        socket.emit('clear');
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