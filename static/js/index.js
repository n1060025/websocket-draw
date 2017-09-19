$(document).ready(()=>{

  var socket = io.connect(),
      objects = {},
      lastPosition = {x: 0, y: 0},
      ctx = $('canvas')[0].getContext('2d'),
      dt = 0,
      possibleColors = ['#111111','#001f3f','#0074D9','#7FDBFF','#39CCCC','#3D9970','#2ECC40','#01FF70','#FFDC00','#FF851B','#FF4136','#85144b','#F012BE','#B10DC9','#AAAAAA','#DDDDDD' ],
      selfColor = 0
      ctx.lineWidth = 2

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

    socket.on('user connect', (userid)=>{
        //alert('user connect '+msg)
        //objects[userid] = {x: 0, y: 0, clr: Math.floor(Math.random()*possibleColors.length)}
        //console.log(objects)
    })

    socket.on('user disconnect', (userid)=>{
        delete objects[userid]

        //ctx.clearRect(0,0,600,600)
      /*  for (var key in objects) {
            //console.log(objects[key])
            draw(ctx, objects[key])
          }*/
    })

    socket.on('self connected', (data)=>{
      data.users.forEach((userid)=>{
        objects[userid] = {x: 0, y: 0}
      })
      selfColor = data.color
      $('.colorSwatch:nth-child('+(data.color+1)+')').addClass('active')
    })

    socket.on('user mousemove', (data)=>{
        //console.log(objects)
        console.log(data)
        //if(objects[data.userid]){

          draw(ctx, data.toPosition, data.fromPosition, possibleColors[ data.color ])
          //objects[data.userid].x = data.position.x
          //objects[data.userid].y = data.position.y
        //}
    })
})

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
