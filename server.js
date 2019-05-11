const httpd = require('http').createServer(handler)
const io = require('socket.io').listen(httpd)
const fs = require('fs')

httpd.listen(4000);

const options = {
    port: 6379,
    host: '**',
    password: '**'
}
var redis = require('redis')
// var RedisStore = require('socket.io/lib/stores/redis')
// var RedisStore = require('socket.io-redis');
// var pub = redis.createClient(options)
// var sub = redis.createClient(options)
// var client = redis.createClient(options)
const redisAdapter = require('socket.io-redis');
io.adapter(redisAdapter(options));

function handler(req, res) {
    fs.readFile(__dirname + '/index.html', (err, data) => {
        if (err) {
            res.writeHead(500)
            return res.end('Error loading index.html')
        }
        res.writeHead(200)
        res.end(data)
    })
}

const CLIENT_MESSAGE = 'clientMessage'
const SERVER_MESSAGE = 'serverMessage'

// io.set('store', new RedisStore({
//     redisPub: pub,
//     redisSub: sub,
//     redisClient: client
// }))
io.sockets.on('connection', socket => {
    socket.on(CLIENT_MESSAGE, content => {
        socket.emit(SERVER_MESSAGE, 'You said: ' + content)
        // socket.broadcast.emit(SERVER_MESSAGE, socket.username + ' said: ' + content)

        let room = socket.room
        if (room) { socket.broadcast.to(room) }
        socket.broadcast.emit(SERVER_MESSAGE, ` ${socket.username} said: ${content}`)
    })

    socket.on('login', username => {
        socket.username = username
        socket.emit(SERVER_MESSAGE, 'Currently logged in as ' + username)
        socket.broadcast.emit(SERVER_MESSAGE, ` User ${username} logged in `)
    })

    socket.emit('login')

    socket.on('disconnect', () => {
        socket.broadcast.emit(SERVER_MESSAGE, `User ${socket.username} disconnected`)
    })

    socket.on('join', room => {
        if (socket.room) {
            socket.leave(socket.room)
        } else {
            socket.room = room
            socket.join(room)
            socket.emit(SERVER_MESSAGE, ` Your joined room: ${room} `)
            socket.broadcast.to(room).emit(SERVER_MESSAGE, ` User ${socket.username} joined this room `)
        }

    })
})

