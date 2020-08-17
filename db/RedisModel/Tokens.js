const client = require("../redis")

function Tokens() {

}

module.exports = new Tokens()

Tokens.prototype.set = (id, token) => {
    client.hset('Tokens', id, token, (err, res) => {
        if (err) console.log(err)
    })
}

Tokens.prototype.get = id => {
    return new Promise(resolve => {
        client.hget('Tokens', id, (err, data) => {
            if (err) console.log(err)
            resolve(data)
        })
    })
}

Tokens.prototype.del = id => {
    return new Promise(resolve => {
        client.hdel('Tokens', id, (err, res) => {
            if (err) console.log(err)
            resolve(res)
        })
    })
}