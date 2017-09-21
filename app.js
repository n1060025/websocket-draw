const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

var users = [],
    usernames=[],
    lastPositions = [] //last mouse opsition are persisted (in memory) here
  //  persistedCanvas //Canvas State is persisted (in memory) here

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
  //interval persists canvas state every 10 secs
  /*setInterval(function(){
    if(users.length >= 1){
      fetchFromUser = users[Math.floor(users.length*Math.random())]
      socket.broadcast.to(fetchFromUser).emit('canvas request', '');
    }
  },10000)*/

  //if there are users online, the canvas is fetched from them, otherwise the persisted version is used
  if(users.length >= 1){
    fetchFromUser = users[Math.floor(users.length*Math.random())]
    socket.broadcast.to(fetchFromUser).emit('canvas request', socket.id);
  }/*else if(persistedCanvas !== undefined){
    socket.emit('canvas send', persistedCanvas);
  }*/

  //save users socketId and mouse position
  users.push(socket.id)
  usernames.push("")
  lastPositions.push({x: 0, y: 0})
  console.log('new user, there are '+ users.length + ' now')


  /*
  *
  * Handle disconnect
  */
  socket.on('disconnect', (msg)=>{
    var index = users.indexOf(socket.id);

    users.splice(index, 1);
    usernames.splice(index, 1);
    lastPositions.splice(index, 1);

    console.log('user disconnected, there are '+ users.length + ' now');


    io.emit('update userlist', usernames);
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
    var i = users.indexOf(socket.id)
    socket.broadcast.emit('user mousemove', {toPosition: data.position, fromPosition: lastPositions[i], color: data.clr});
    lastPositions[i] = data.position
  });


  /*
  *
  * Handle end of mouseStroke (mouseup)
  */
  socket.on('strokeEnd', function(position){
    var i = users.indexOf(socket.id)
    lastPositions[i] = undefined
  })

  /*
  *
  * Forward clear request to all users
  */
  socket.on('clear', function(){
    socket.broadcast.emit('clear')
  })


  socket.on('send username', username=>{


    usernames[users.indexOf(socket.id)] = username

    console.log(username)
    io.emit('update userlist', usernames);
  })

})






http.listen(8080, ()=>{
  console.log('http+websocket listening on port 8080, check version');
});


// Handle requests to non-existing ressources / send 404 not available
app.get('*', (req, res)=>{
  console.log('get request to: '+ req.url)

  res.status(404).send('ERROR 404 at: <strong>'+ req.url
  +'</strong>    this resource does not exist yet')
})
