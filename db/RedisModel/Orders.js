const client = require("../redis")

function Orders() {

}

module.exports = new Orders()

Orders.prototype.SetOrder = (id, order) => {
    client.rpush(id, order, (err, res) => {
        if (err) console.log(err)
    })
}

Orders.prototype.GetOrder = id => {
    return new Promise(resolve => {
        client.lrange(id, 0, -1, (err, data) => {
            if (err) console.log(err)
            resolve(data)
        })
    })
}

Orders.prototype.GetOrderIndex = (id, index) => {
    return new Promise(resolve => {
        client.lindex(id, index, (err, data) => {
            if (err) console.log(err)
            resolve(data)
        })
    })
}

Orders.prototype.DelOrder = (id, index) => {
    return new Promise(resolve => {
        client.lset(id, index, "__SILINECEK_ITEM__", (err, data) => {
            if (err) console.log(err)
            client.lrem(id, 0, "__SILINECEK_ITEM__", (err1, data1) => {
                if (err1) console.log(err1)
                resolve(data1)
            })
        })
    })
}