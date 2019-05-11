const httpd = require('http').createServer(handler)
const io = require('socket.io').listen(httpd)
const fs = require('fs')

httpd.listen(4000);

function handler(req, res){
    fs.readFile(__dirname + '/index.html', (err, data) => {
        if(err){
            res.writeHead(500)
            return res.end('Error loading index.html')
        }
        res.writeHead(200)
        res.end(data)
    })
}

io.sockets.on('connection', socket => {
    socket.on('clientMessage', content => {
        socket.emit('serverMessage', 'You said: ' + content)
        socket.broadcast.emit('serverMessage', socket.id + ' said: ' + content)
    })
})

