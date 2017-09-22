$(document).ready(()=>{

  var socket = io.connect(),
      objects = {},
      lastPosition = {x: 0, y: 0},
      ctx = $('canvas')[0].getContext('2d'),
      dt = 0,
      possibleColors = ['#111111','#001f3f','#0074D9','#7FDBFF','#39CCCC','#3D9970','#2ECC40','#FFDC00','#FF851B','#FF4136','#85144b','#E20074','#B10DC9','#AAAAAA','#DDDDDD','#FFFFFF' ],
      selfColor = Math.floor(Math.random()*15),
      authenticated = false
      $('.colorSwatch:nth-child('+(selfColor+1)+')').addClass('active')
      ctx.lineWidth = 2

      var name = getCookie('username')
      if(authenticated == false  && name !== undefined && name !== ''){
        socket.emit('send username', name)
        setCookie(name)
        $('section.username').addClass('hidden')
        $('section.draw').removeClass('hidden')
        authenticated = true
      }



      $('#username-form').submit(e => {
        var name = $('#username-input').val()
        if(authenticated == false  && name !== undefined && name !== ''){//TODO: implement safer rules
          socket.emit('send username', name)
          setCookie(name)
          $('section.username').addClass('hidden')
          $('section.draw').removeClass('hidden')
          authenticated = true
        }
        return false
      })


$('canvas').on('mousedown dragstart', (e1)=>{
    if(e1.which == 2 || e1.which == 3) return

    e1.preventDefault()
    lastPosition = {x: e1.offsetX, y: e1.offsetY}
    $('canvas').on('mousemove', (e)=>{
      if((lastPosition.x !== e.offsetX || lastPosition.y !== e.offsetY)
      && (Date.now() - dt > 15)
      //&&((lastPosition.x - e.offsetX)*(lastPosition.x - e.offsetX) > 10 || (lastPosition.x - e.offsetX)*(lastPosition.x - e.offsetX) > 10)
    ){
      dt = Date.now()
        draw(ctx, {x: e.offsetX, y:e.offsetY}, lastPosition, possibleColors[ selfColor ])
        lastPosition = {x: e.offsetX, y: e.offsetY}
        socket.emit('user mousemove', {position: {x: e.offsetX, y: e.offsetY}, clr: selfColor})
      }})

      $('canvas').on('mouseout', (e5)=>{
          draw(ctx, {x: e5.offsetX, y:e5.offsetY}, lastPosition, possibleColors[ selfColor ])
          lastPosition = {x: e5.offsetX, y: e5.offsetY}
          socket.emit('user mousemove', {position: {x: e5.offsetX, y: e5.offsetY}, clr: selfColor})
      })

      $(document).on('mouseup', ()=>{
      //  alert();
          $('canvas').unbind('mousemove mouseout')
          socket.emit('strokeEnd')
      })
    })

    $('.colorSwatch').on('click', function(){
      $('.active').removeClass('active')
      selfColor = possibleColors.indexOf(this.dataset.color)
      //alert(selfColor)
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

function setCookie(name) {
    var d = new Date();
    d.setTime(d.getTime() + (5*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = "username=" + name + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
