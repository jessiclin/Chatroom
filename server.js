const mongo = require('mongodb').MongoClient;
// Run socket.io on port 4000 
const client = require('socket.io').listen(4000).sockets;


// Connect to MongoDB using localhost 
mongo.connect('mongodb://127.0.0.1', { useUnifiedTopology: true },
    function(err, monClient){
        if (err){
            throw err;
        }

        console.log('MongoDB connected');

        // Get database object 
        var db = monClient.db('chatroom');

        // Connect to socket.io 
        client.on('connection', function(socket){
            // use db to run queries 
            let chat = db.collection('chats');

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
            socket.on('clear', function(data){
                // Remove all chats from the collection 
                chat.remove({}, function(){
                    socket.emit('cleared');
                });
            });
        });

    });