const express = require('express')
const http = require('http')
const path =require('path')
const socketio = require('socket.io')

const app=express();
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))
 
// let count = 0

io.on('connection',(socket)=>{
    console.log('New Web Socket Connection')

    socket.emit('message','Welcome! to the Chat App');
    socket.broadcast.emit('message','A new user is joined')

    socket.on('sendMessage',(message,callback) => {
        io.emit('message',message);
        callback()
    })

    socket.on('disconnect',()=>{
        io.emit('message', 'A user has left')
    })
    socket.on('sendLocation',(coords)=>{
        io.emit('message', `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`)
    })
    // socket.on('increment',()=>{
    //     count++
    //     //socket.emit('countUpdated',count )
    //     io.emit('countUpdated',count )
    // })
})


server.listen(port, ()=>{
    console.log(`Server is up on port ${port}!`)
})
