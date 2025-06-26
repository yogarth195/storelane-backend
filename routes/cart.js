const express = require("express")
const router = express.Router();
const { Account, Product } = require('../db');
const authMiddleware = require("../middleware/authenticateMiddleware");
const { default: mongoose } = require("mongoose");


router.get("/", authMiddleware, async(req, res) => {
    try {
        const userId = req.userId;
        const account = await Account.findOne({ userId }).populate('productsInCart.productId')
        if(!account) {
            return res.status(404).json({
                message: "Account doesn't exist"
            });
        }

        if (!account.productsInCart || account.productsInCart.length === 0) {
            return res.status(200).json({
                message: "Your cart is empty"
            });
        }

        // Enrich the cart with product details while handling null references
        const enrichedCart = account.productsInCart.filter(item => item.productId !== null);

        // If all products are missing, you can handle that case as well
        if (enrichedCart.length === 0) {
            return res.status(404).json({
                message: "No valid products found in cart"
            });
        }

        // Send the enriched cart data
        res.status(200).json({
            productsInCart: account.productsInCart
        });

    } catch(err) {
        console.error(err);
        res.status(500).json({
            message: "Server Error"
        })
    }
})

router.get("/cart-count", authMiddleware, async(req, res) => {
    try {
        const userId = req.userId;
        const account = await Account.findOne({userId});
        if(!account) {
            return res.json({
                message: "Account doesn't exist"
            })
        }

        const productCount = account.productsInCart.length;
        res.status(200).json({
            productCount,
        })
    } catch(err) {
        res.status(500).json({
            message: "Server Error",
        })
    }
})

router.put("/add-to-cart", authMiddleware, async(req, res) => {
    try {
        const { productId, quantity } = req.body;

        //Validating input. 
        if(!productId || quantity<=0) {
            return res.status(400).json({
                message: "Invalid productID or quanitity less than 0(zero)"
            })
        }


        const product = await Product.findOne({ _id: productId });
        if(!product) {
            return res.status(404).json({
                message: "Product Not found."
            })
        }


        if(product.units < quantity) {
            return res.status(400).json({
                error: "not enough units in stock",
                availableUnits : product.units,
            })
        }

        const account = await Account.findOne({userId : req.userId});
        if(!account) {
            return res.status(404).json({
                message: "Account not found"
            })
        }

        let productIndex = -1
        productIndex = account.productsInCart.findIndex(
            (e) => e.productId && e.productId.toString() === productId
        );

        if(productIndex === -1) {
            //doesn't exist. 
            account.productsInCart.push({
                productId: productId,
                quantity,
            })
        } else {
            account.productsInCart[productIndex].quantity += quantity;
        }


        await account.save();
        return res.status(200).json({
            message: "product added to the cart. Below is the final cart: ",
            cart: account.productsInCart,
        })
    } catch(err) {
        console.error("Error adding product to cart: ", err);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
})

router.delete("/delete-from-cart", authMiddleware, async(req, res) => {
    try {
        const {productId} = req.body;
        if(!productId) {
            return res.status(500).json({
                message: "No product ID given."
            })
        }

        const product = await Product.findOne({_id: productId});
        if(!product) {
            return res.status(404).json({
                message: "No such ProductID exists"
            })
        }
        
        const account = await Account.findOne({userId : req.userId});
        if(!account) {
            return res.status(404).json({
                message: "Account not found"
            })
        }

        let productIndex = -1;
        productIndex = account.productsInCart.findIndex(
            (e) => e.productId && e.productId.toString() === productId
        );
        if (productIndex === -1) {
            // Product doesn't exist in the cart
            return res.json({
                message: "Product wasn't in the cart."
            })
        } else {
            account.productsInCart.splice(productIndex, 1); // Removes the product from the cart
            await account.save();
            return res.json({
                message: "Product successfully removed from the cart. "
            })
        }
    } catch(err) {
        return res.status(500).json({
            message: "Internal server error"
        })
    }
})


router.delete("/delete-unnecessary", authMiddleware, async(req, res) => {
    try {
        const account = await Account.findOne({ userId: req.userId });

        if (!account) {
            return res.status(404).json({ error: "Account not found" });
        }

        // Extract the product IDs from the products in the cart
        const productIdsInCart = account.productsInCart.map(item => item.productId);

        // Find the valid products from the database
        const validProducts = await Product.find({
            'productId': { $in: productIdsInCart }
        });

        // Filter the valid products in the cart based on the product IDs in the database
        const validCartItems = account.productsInCart.filter(item =>
            validProducts.some(product => product.productId.toString() === item.productId.toString())
        );

        // Filter the invalid products (those not found in the database)
        const invalidProducts = account.productsInCart.filter(item =>
            !validProducts.some(product => product.productId.toString() === item.productId.toString())
        );

        // If invalid products exist, remove them from the cart
        if (invalidProducts.length > 0) {
            // Remove invalid products from cart in the database
            account.productsInCart = validCartItems;
            await account.save();
            return res.status(400).json({
                message: "Some products were not found in the database and have been removed from the cart.",
                invalidProducts
            });
        }

        // If no invalid products, return a success message
        return res.status(200).json({ message: "Cart is up to date with valid products." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
})
module.exports = router
