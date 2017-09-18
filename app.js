const express = require('express')
const app = express()

var http = require('http').Server(app);
var io = require('socket.io')(http);
var users  = []
/*
app.listen(8080, ()=>{
  console.log('express listening on port 8080')
})*/


//Index Page
app.get('/',(req, res)=>{
   res.sendFile(__dirname+'/static/html/index.html')
})

//Static Resources
app.use('/static/js/', express.static(__dirname+'/static/js/'))



io.on('connection', socket =>{
  users.push(socket.id)
  //console.log(users)
  console.log('a user connected '+socket.id+', there are '+ users.length + ' now');

  socket.emit('get users', users); //to new user
  socket.broadcast.emit('user connect', socket.id); //to all the old users

  socket.on('disconnect', function(msg){

      //delete users[socket.id]
      var index = users.indexOf(socket.id);
      users.splice(index, 1);

      console.log('a user disconnected, there are '+ users.length + ' now');
      io.emit('user disconnect', socket.id);
    });

    socket.on('user mousemove', function(position){
        socket.broadcast.emit('user mousemove', {position: position, userid: socket.id});
      });
});


http.listen(8080, ()=>{
  console.log('http+websocket listening on port 8080');
});


//404 not available
app.get('*', (req, res)=>{
  console.log('get request to: '+ req.url)

  res.status(404).send('ERROR 404 at: <strong>'+ req.url
  +'</strong>    this resource does not exist yet')
})
