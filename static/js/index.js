$(document).ready(()=>{

  var socket = io.connect(),
      objects = {},
      lastPosition = {x: 0, y: 0},
      ctx = $('canvas')[0].getContext('2d'),
      dt = 0,
      possibleColors = ['#001f3f','#0074D9','#7FDBFF','#39CCCC','#3D9970','#2ECC40','#01FF70','#FFDC00','#FF851B','#FF4136','#85144b','#F012BE','#B10DC9','#111111','#AAAAAA','#DDDDDD' ]
      ctx.strokeStyle = possibleColors[Math.floor(Math.random()*possibleColors.length)]
      ctx.lineWidth = 2


    $('canvas').on('mousemove', (e)=>{
      if((lastPosition.x !== e.offsetX || lastPosition.y !== e.offsetY)
      && (Date.now() - dt > 20)
      //&&((lastPosition.x - e.offsetX)*(lastPosition.x - e.offsetX) > 10 || (lastPosition.x - e.offsetX)*(lastPosition.x - e.offsetX) > 10)
    ){
      dt = Date.now()
        draw(ctx, {x: e.offsetX, y:e.offsetY}, lastPosition)
        lastPosition = {x: e.offsetX, y: e.offsetY}
        socket.emit('user mousemove', {x: e.offsetX, y: e.offsetY})
    }})

    socket.on('button click', (timestamp)=>{
        $('ul').append('<li>button was clicked '+(Date.now() - parseInt(timestamp))+'ms ago</li>')
    })

    socket.on('user connect', (userid)=>{
        //alert('user connect '+msg)
        objects[userid] = {x: 0, y: 0}
        console.log(objects)
    })

    socket.on('user disconnect', (userid)=>{
        delete objects[userid]

        //ctx.clearRect(0,0,600,600)
        for (var key in objects) {
            //console.log(objects[key])
            draw(ctx, objects[key])
          }
    })

    socket.on('user mousemove', (data)=>{
        //console.log(objects)
        //console.log(data.position)
        if(objects[data.userid])
          draw(ctx, data.position, objects[data.userid])

        //ctx.clearRect(0,0,600,600)
        /*for (var key in objects) {
            //console.log(objects[key])
            draw(ctx, objects[key])
          }*/
        objects[data.userid] = data.position
    })
})

function draw(ctx, object, last){
  ctx.beginPath();

  if( last !== undefined && (!!last.x || !!last.y)){
    ctx.moveTo(last.x, last.y)
    ctx.lineTo(object.x, object.y)
    //ctx.arc(object.x,object.y,5,0,2*Math.PI);
    ctx.stroke()
  }
}
