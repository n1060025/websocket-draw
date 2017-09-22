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

$('canvas').on('mousedown dragstart touchstart', (e1)=>{
    if(e1.type === 'mousedown' && (e1.which == 2 || e1.which == 3)) return
    e1.preventDefault()

    lastPosition = {x: e1.offsetX, y: e1.offsetY}
    $('canvas').on('mousemove touchmove', (e)=>{
      console.log(e)
      var x = e.offsetX || (e.touches[0].pageX - $('canvas').offset().left),
      y = e.offsetY || (e.touches[0].pageY - $('canvas').offset().top)

      if((lastPosition.x !== x || lastPosition.y !== y)
      && (Date.now() - dt > 15)){
        dt = Date.now()
        draw(ctx, {x: x, y:y}, lastPosition, possibleColors[ selfColor ])
        lastPosition = {x: x, y: y}
        socket.emit('user mousemove', {position: {x: x, y: y}, clr: selfColor})
      }})

      $('canvas').on('mouseout', (e5)=>{
          draw(ctx, {x: e5.offsetX, y:e5.offsetY}, lastPosition, possibleColors[ selfColor ])
          lastPosition = {x: e5.offsetX, y: e5.offsetY}
          socket.emit('user mousemove', {position: {x: e5.offsetX, y: e5.offsetY}, clr: selfColor})
      })

      $(document).on('mouseup touchend', ()=>{
          $('canvas').unbind('mousemove mouseout')
          socket.emit('strokeEnd')
      })
    })

    $('.colorSwatch').on('click', function(){
      $('.active').removeClass('active')
      selfColor = possibleColors.indexOf(this.dataset.color)
      $(this).addClass('active')
  })

  $('.clearButton').on('click', function(){
    ctx.clearRect(0,0,500,500)
    socket.emit('clear')
  })


    socket.on('canvas send', (canvasData)=>{
          console.log('received canvas data')
          console.log(canvasData)
          var imgData = ctx.createImageData(500, 500);
          for(var i = 0; i < canvasData.length; i++) imgData.data[i] = canvasData[i]
          ctx.putImageData(imgData, 0, 0)
          $('.spinner').addClass('hidden')
    })

    /*
    * send current state of canvas to server
    */
    socket.on('canvas request', (toUserId)=>{
          var canvasData = ctx.getImageData(0,0,500,500)
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

    socket.on('usercount update', usercount =>{
            $('.userCount span').text(usercount)
            if(usercount === 1)
              $('.spinner').addClass('hidden')
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
