const redis = require('redis')
let client

function Tokens () {
  client = redis.createClient({
    host: 'redis-11835.c55.eu-central-1-1.ec2.cloud.redislabs.com',
    port: '11835',
    password: process.env.REDIS_URI
  })

  client.on('ready', function () {
    console.log('REDIS READY')
  })

  client.on('error', function (error) {
    console.error(error)
  })
}

module.exports = new Tokens()

// Tokens.prototype.test = () => {
//   client.hset('Test', String(Math.random()), String(Math.random()), (err, res) => {
//     if (err) console.log(err)
//   })
// }

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
