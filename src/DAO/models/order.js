import mongoose from "mongoose";

const collection = "Orders"

const schema = new mongoose.Schema({
    number: Number,
    cart: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "cartModel"
    },
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "usersModel"
    },
    products: [],
    totalPrice: Number,
    status: String,
    //ref: "productModel"
})

const orderModel = mongoose.model(collection, schema)
export default orderModel