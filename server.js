const bcrypt = require('bcrypt')

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
        let db = monClient.db('chatroom');

        // Connect to socket.io 
        client.on('connection', function(socket){
            // use db to run queries 
            let chat = db.collection('chats');
            let users = db.collection('users');
            let mes = db.collection('messages');

            // Function to send status 
            sendStatus = function(status){
                // Pass status from server to client 
                socket.emit('status', status);
            }

            // Handle login 
            socket.on('login', function(data){
                let email = data.email;
                let password = data.password;


                users.find({email: email}).toArray(function(err, result){
                    if (err){
                        throw err;
                    }

                    if (result.length === 1){
                        let hash = result[0].pass;
                        bcrypt.compare(password, hash, (err, res) => {
                            if (err) {
                              throw err;
                            }

                            if(res)
                                socket.emit('login-success', result[0]);    
                            else
                                socket.emit('login-unsuccessful');
                        })
                    }
                    else{
                        socket.emit('login-unsuccessful');
                    }
                });
            });
            
            // Handle creating a new account 
            socket.on('new-acct', function(data){
                let email = data.email;
                let first = data.first;
                let last = data.last;
                let user = data.user;
                let pass = data.pass;

                // Check if email is in use
                users.find({email : email}).toArray(function(err, result){
                    if (err){
                        throw err;
                    }
                    if (result.length > 0){
                        client.emit('unsuccessful');
                    }
                    else{
                        // Enter new account 
                        bcrypt.hash(pass, 10, (err, hash) => {
                            if (err) {
                            console.error(err)
                            return
                          }

                          users.insertOne({email: email, first : first, last: last, user : user, pass : hash}, function(){
                            client.emit('output', email);

                            // Send status object 
                            sendStatus({
                                message: 'Account created successfully',
                                clear: true
                            });
                            });
                        })
                    }
                });
            });

            // Get username 
            socket.on('get-user', function(data){

                users.find({email : data}).toArray(function(err, result){
                    if (err)
                        throw err;
  
                    socket.emit('username', result[0].user);
                });
            });

            // Get chats from mongo collection 
            socket.on('get-chats', function(data){
                chat.find({group : data}).toArray(function(err, result) {
                    if (err){
                        throw err;
                    }
                    socket.emit('chats', result);
                })
            });

            socket.on('get-messages', function(data){
                mes.find({users : data.users, group : data.group}).toArray(function(err, result){
                    if (err){
                        throw err;
                    }

                    socket.emit('output', result);
                });
            });

            // Handle input events 
            socket.on('input', function(data){
                let name = data.from;
                let email = data.email;
                let message = data.message;
                let group = data.group;
                let users = data.users;

                // Check that name and message exits 
                if (name == '' || message == ''){
                    sendStatus('Enter a name and message'); 
                }
                else{
                    // Insert message into database 
                    mes.insertOne({from: name, email : email, group: group, users:users, message: message}, function(){
                        client.emit('output', [data]);

                        // Send status object 
                        sendStatus({
                            message: 'Message Sent',
                            clear: true
                        });
                    });
                }
            });

        });

    });