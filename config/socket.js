const app = require('./app')
const server = require('http').createServer(app);
const jwt = require('jsonwebtoken');
const Tokens = require('../db/RedisModel/Tokens')

const io = require('socket.io')(server);

io.on('connection', socket => {
    let token = socket.handshake.query.token;
    try {
        jwt.verify(token, process.env.API_SECRET_KEY, async (err, data) => {
            if (err)
                return socket.disconnect()

            if (!data)
                return socket.disconnect()

            const storedToken = await Tokens.get(data.Id)
            if (storedToken == token)
                socket.join(data.Id)
            else {
                return socket.disconnect()
            }
        })
    } catch (error) {
        console.log(error)
    }
});

module.exports.io = io
module.exports.server = server