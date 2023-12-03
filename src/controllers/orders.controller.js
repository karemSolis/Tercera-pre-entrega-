import ordersDao from "../DAO/classes/orders.dao.js"

export const getOrders = async (req, res) => {
    res.send({status: "success", result: "getOrders"})
}

export const getOrdersById = async (req, res) => {
    res.send({status: "success", result: "getOrdersById"})
}


export const createOrder = async (req, res) => {
    res.send({status:"success", result: "createOrder"})
}

export const resolveOrder = async (req, res) => {
    res.send({status: "success", result: "resolveOrder"})
}