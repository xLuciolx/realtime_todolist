var express = require('express');
var http = require('http');
var ent = require('ent');

var app = express();
var server = http.createServer(app);

var io = require('socket.io').listen(server);

// Initilize the todolist
var todolist = [];
var index;

app
    .get('/todolist', function(req,res){
        res.sendFile(__dirname + '/index.html');
    })
    // redirect to homepage
    .use(function(req, res, next){
        res.redirect('/todolist');
    });

io.sockets.on('connection', function(socket){
    socket
        // On connection send the todolist
        .emit('todolist', todolist)

        // Add a todo, escape html tags and push new todo in the array
        .on('addTodo', function(todo){
            todo = ent.encode(todo);
            todolist.push(todo);
            index = todolist.length-1;
            socket.broadcast.emit('addTodo', {todo: todo, index: index});
        })

        // Delete a todo, remove it from the array and update the todolist for all users
        .on('deleteTodo', function(index){
            todolist.splice(index, 1);
            io.sockets.emit('todolist', todolist);
        });
});

server
    .listen(8080);
