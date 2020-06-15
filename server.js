const mongo = require('mongodb').MongoClient;
// Run socket.io on port 4000 
const client = require('socket.io').listen(4000).sockets;

// Connect to MongoDB
mongo.connect('mongodb://localhost:27017/chatroom', { useUnifiedTopology: true },
    function(err, db){
        if (err){
            throw err;
        }

        console.log('MongoDB connected');

        // Connect to socket.io 
        client.on('connection', function(){
            // use db to run queries 
            let chat = db.collections('chats');

            // Function to send status 
            sendStatus = function(status){
                // Pass status from server to client 
                socket.emit('status', status);
            }

            // Get chats from mongo collection 
            chat.find().limit(100).sort({_id:1}).toArray(function(err, result){
                if (err){
                    throw err;
                }

                socket.emit('output', result);
            });

            // Handle input events 
            socket.on('input', function(data){
                let name = data.name;
                let message = data.message;

                // Check that name and message exits 
                if (name == '' || message == ''){
                    sendStatus('Enter a name and message'); 
                }
                else{
                    // Insert message into database 
                    chat.insert({name: name, message: message}, function(){
                        client.emit('output', [data]);

                        // Send status object 
                        sendStatus({
                            message: 'Message Sent',
                            clear: true
                        });
                    });
                }
            });

            // Handle clear 
            socket.one('clear', function(data){
                // Remove all chats from the collection 
                chat.remove({}, function(){
                    socket.emit('cleared');
                });
            });
        });

    });