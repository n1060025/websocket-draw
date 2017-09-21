const express = require('express')
const app = express()

var http = require('http').Server(app);
var io = require('socket.io')(http);
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
  console.log('a user connected '+socket.id);
  io.emit('user connect', socket.id);

  socket.on('disconnect', function(msg){
      console.log('a user disconnected');
      io.emit('user disconnect', socket.id);
    });

    socket.on('user mousemove', function(position){
        io.emit('user mousemove', {position: position, userid: socket.id});
      });
});


http.listen(8080, ()=>{
  console.log('http listening on port 3000');
});


//404 not available
app.get('*', (req, res)=>{
  res.status(404).send('ERROR 404 at: <strong>'+ req.url
  +'</strong>    this resource does not exist yet')
})
