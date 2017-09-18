$(document).ready(()=>{

  var socket = io.connect('http://localhost:3000'),
      objects = {},
      lastPosition = {x: 0, y: 0},
      ctx = $('canvas')[0].getContext('2d')

    $('canvas').on('mousemove', (e)=>{
      if(lastPosition.x !== e.offsetX || lastPosition.y !== e.offsetY)
        lastPosition = {x: e.offsetX, y: e.offsetY}
        socket.emit('user mousemove', {x: e.offsetX, y: e.offsetY})
    })

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

        ctx.clearRect(0,0,600,600)
        for (var key in objects) {
            //console.log(objects[key])
            draw(ctx, objects[key])
          }
    })

    socket.on('user mousemove', (data)=>{
        //console.log(objects)
        objects[data.userid] = data.position
        //console.log(data.position)

        //ctx.clearRect(0,0,600,600)
        for (var key in objects) {
            //console.log(objects[key])
            draw(ctx, objects[key])
          }
    })
})

function draw(ctx, object){
  ctx.beginPath();
  ctx.arc(object.x,object.y,5,0,2*Math.PI);
  ctx.fill()
}
