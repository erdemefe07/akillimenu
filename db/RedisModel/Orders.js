const client = require("../redis")

function Orders() {

}

module.exports = new Orders()

Orders.prototype.SetOrder = (id, table, order) => {
    client.hset(id, table, order, (err, res) => {
        if (err) console.log(err)
    })
}

Orders.prototype.GetOrder = id => {
    return new Promise(resolve => {
        client.hgetall(id, (err, data) => {
            if (err) console.log(err)
            resolve(data)
        })
    })
}

Orders.prototype.GetOrderIndex = (id, table) => {
    return new Promise(resolve => {
        client.hget(id, table, (err, data) => {
            if (err) console.log(err)
            resolve(data)
        })
    })
}

Orders.prototype.DelOrder = (id, table) => {
    return new Promise(resolve => {
        client.hdel(id, table, (err, data) => {
            if (err) console.log(err)
                resolve(data)
        })
    })
}