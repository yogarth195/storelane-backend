const { Order }= require("../db")


const getOrders = async(req, res) => {
    try {
        const userId = req.userId;
        const orders = await Order.find({ user: userId }).populate("products.productId");



        res.status(200).json({
            orders
        });
    } catch (err) {
        console.error("Order Fetch Error: ", err);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}


module.exports = { getOrders };