const { Product } = require("../db");

const checkProductOwnerShip = async (req, res, next) => {
    try {
        const productId = req.params.id;

        const product = await Product.findById(productId);

        if(!product) {
            return res.status(404).json({
                message: "Product does not exist"
            })
        }

        if(product.seller.toString() !== req.userId) {
            return res.status(403).json({
                message: "Unauthorized: Not you product"
            });
        }


        // Pass product for later use if needed
        req.product = product;

        next();
    } catch(error) {
        console.error("OwnerShip check failed: ", error);
        res.status(500).json({
            message: "Server Error Checking product's ownership"
        });
    }
};


module.exports = checkProductOwnerShip;