const redis = require('redis')

let client = redis.createClient({
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

module.exports = client