import orderModel from "../models/order.js"
import CartDao from "./cart.dao.js"

class ordersDao {
    constructor () {
        this.cartDao = new CartDao
    }

    async getOrders () {
        try {
            const orders = await this.carDao.find().lean()
            return orders;
        }
        catch (error){
            return "No se puede obtener la orden"
        }

    }

    async getOrderById (orderId) {
        const order = await orderModel.exist(orderId)
        if (!order) return "orden no existe"
        return order; 

    }
    
    async createOrder () {
        const order = await orderModel.create({ order: []})
        return "Orden creada"

    }
    
    async resolveOrder () {

    }
    


}

export default ordersDao

