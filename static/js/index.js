$(document).ready(()=>{

  var socket = io.connect(),
      objects = {},
      lastPosition = {x: 0, y: 0},
      ctx = $('canvas')[0].getContext('2d'),
      dt = 0,
      possibleColors = ['#111111','#001f3f','#0074D9','#7FDBFF','#39CCCC','#3D9970','#2ECC40','#FFDC00','#FF851B','#FF4136','#85144b','#E20074','#B10DC9','#AAAAAA','#DDDDDD','#FFFFFF' ],
      selfColor = Math.floor(Math.random()*15)
      $('.colorSwatch:nth-child('+(selfColor+1)+')').addClass('active')
      ctx.lineWidth = 2







      $('#username-form').submit(e => {
        var name = $('#username-input').val()
        if(name !== undefined && name !== '' && name !== ' '){//TODO: implement safer rules
          socket.emit('send username', name)
          $('section.username').addClass('hidden')
          $('section.draw').removeClass('hidden')
        }
        return false
      })


$('canvas').on('mousedown', (e1)=>{

    lastPosition = {x: e1.offsetX, y: e1.offsetY}
    $('canvas').on('mousemove', (e)=>{
      if((lastPosition.x !== e.offsetX || lastPosition.y !== e.offsetY)
      && (Date.now() - dt > 20)
      //&&((lastPosition.x - e.offsetX)*(lastPosition.x - e.offsetX) > 10 || (lastPosition.x - e.offsetX)*(lastPosition.x - e.offsetX) > 10)
    ){
      dt = Date.now()
        draw(ctx, {x: e.offsetX, y:e.offsetY}, lastPosition, possibleColors[ selfColor ])
        lastPosition = {x: e.offsetX, y: e.offsetY}
        socket.emit('user mousemove', {position: {x: e.offsetX, y: e.offsetY}, clr: selfColor})
      }})
    })

    $(document).on('mouseup', (e5)=>{
        $('canvas').unbind('mousemove')
        socket.emit('strokeEnd')
    })

    $('.colorSwatch').on('click', function(){
      $('.active').removeClass('active')
      selfColor = possibleColors.indexOf(this.dataset.color)
      //alert(selfColor)
      $(this).addClass('active')
  })

  $('.clearButton').on('click', function(){

    ctx.clearRect(0,0,400,400)
    socket.emit('clear')
  })

    socket.on('clear', ()=>{
        ctx.clearRect(0,0,400,400)
    })

    socket.on('button click', (timestamp)=>{
        $('ul').append('<li>button was clicked '+(Date.now() - parseInt(timestamp))+'ms ago</li>')
    })

    socket.on('canvas send', (canvasData)=>{
          console.log('received canvas data')
          console.log(canvasData)
          var imgData = ctx.createImageData(400, 400);
          for(var i = 0; i < canvasData.length; i++) imgData.data[i] = canvasData[i]
          ctx.putImageData(imgData, 0, 0)
    })

    /*
    * send current state of canvas to server
    */
    socket.on('canvas request', (toUserId)=>{
          var canvasData = ctx.getImageData(0,0,400,400)
          var dataArray = []
          for(var i = 0; i < canvasData.data.length; i++) dataArray.push(canvasData.data[i])
          console.log(canvasData)
          socket.emit('canvas send', dataArray, toUserId)
    })

    /*
    * the mousmove events the socket-backend sends is received here
    */
    socket.on('user mousemove', (data)=>{
          draw(ctx, data.toPosition, data.fromPosition, possibleColors[ data.color ])
    })

    socket.on('update userlist', usernames =>{
      //alert(usernames)
      //TODO: remove all Loop and add to list
      //if name not  empty string ''
      $('.username-li').remove()
      usernames.forEach(user => {
        $('.userlist').append('<li class="username-li" data-name="' + user + '">' + user + '</li>')
      })
    })
})






//helper functions

function draw(ctx, object, last, color){
  ctx.beginPath();
  if( last !== undefined && (!!last.x || !!last.y)){
    ctx.moveTo(last.x, last.y)
    ctx.lineTo(object.x, object.y)
    ctx.strokeStyle = color
    //console.log(color)
    ctx.stroke()
  }
}
