"use strict";
exports.UserStorage = class{

  constructor(){
    this.userArray = []
    this.idArray = []
  }

  addUser(socketId){
    this.userArray.push(new User(socketId))
    this.idArray[socketId] = this.userArray.length - 1
  }

  removeUser(socketId){
    this.userArray.splice(this.idArray[socketId], 1)
    delete this.idArray[socketId]
    var len = this.userArray.length
    for(var i = 0; i < len; i++){
      var user = this.userArray[i]
      this.idArray[user.socketId] = i
    }
  }

  getUser(socketId){
    //console.log('userarray')
      //console.log(this.idArray)
    if(this.idArray[socketId] == undefined) return
    return this.userArray[this.idArray[socketId]]
  }
  getUserCount(){
    return this.userArray.length
  }
}



function User(socketId){
  this.position = undefined
  this.socketId = socketId
}
