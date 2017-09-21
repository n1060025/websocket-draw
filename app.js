const express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    UserStorage = require('./classes/userStorage').UserStorage

var users = new UserStorage()


/*
*
* Serve Static Resources
*/
app.use('/static/js/', express.static(__dirname+'/static/js/'))
app.get('/', (req, res)=>{res.sendFile(__dirname+'/static/html/index.html')})

/*
*
* Connections to the websocket interface are handled here
*/
io.on('connection', socket =>{
  console.log('new connection')

  //if there are users online, the canvas is fetched from them, otherwise the persisted version is used
  if(users.getUserCount() >= 1){
    socket.broadcast.emit('canvas request', socket.id);
    console.log('request canvas drawing from users')
  }

  /*
  *
  * Handle disconnect
  */
  socket.on('disconnect', (msg)=>{
    users.removeUser(socket.id)
    console.log('user disconnected, there are '+ users.getUserCount() + ' now');
    io.emit('update userlist', users.getUsernames());

  })

  /*
  *
  *Handle Response from user that sends canvas data
  */
  socket.on('canvas send', (canvasData, toUserId)=>{
    if(toUserId !== ''){
      console.log('send canvas to new user')
      socket.broadcast.to(toUserId).emit('canvas send', canvasData)
    }else{
      console.log('keep data updated')
    }
    persistedCanvas = canvasData
  })

  /*
  *
  * Forward all mousestrokes between users
  */
  socket.on('user mousemove', (data)=>{

      var user = users.getUser(socket.id)
    if(user != undefined){
      socket.broadcast.emit('user mousemove', {
        toPosition: data.position,
        fromPosition: user.position,
        color: data.clr
      })
      user.position = data.position
    }else{
      socket.emit('reauthenticate')
    }
  });


  /*
  *
  * Handle end of mouseStroke (mouseup)
  */
  socket.on('strokeEnd', function(position){
    if(users.getUser(socket.id) != undefined){
      users.getUser(socket.id).position = undefined
    }else{
        //socket.emit('reauthenticate')
      }
  })

  /*
  *
  * Forward clear request to all users
  */
  socket.on('clear', function(){
    socket.broadcast.emit('clear')
  })

//TODO: validate username

  socket.on('send username', username=>{
    users.addUser(socket.id, username)
    console.log('new user: ' + username)
    console.log(users.getUsernames())
    io.emit('update userlist', users.getUsernames());
  })
})






http.listen(8080, ()=>{
  console.log('http + websocket listening on port 8080');
});


// Handle requests to non-existing ressources / send 404 not available
app.get('*', (req, res)=>{
  console.log('get request to: '+ req.url)

  res.status(404).send('ERROR 404 at: <strong>'+ req.url
  +'</strong>    this resource does not exist yet')
})
