
exports.User = class{
  constructor(_socketId, _name){
    this.socketId = _socketId
    this.name = _name

    this.lastPosition = {x: -1, y:-1}
    this.lastClr = -1
  }



}
