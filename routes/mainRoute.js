const express = require("express")
const userRoutes = require("./user");
const productRoute = require("./product");
const profileRoute = require("./profile");
const cartRoute = require("./cart");
const checkoutRoute = require("./checkout");
const sellerRoute = require("./sellerRoute");


const router = express.Router();

router.use("/user", userRoutes);

router.use("/products", productRoute);

router.use("/profile", profileRoute);

router.use("/cart", cartRoute)

router.use("/checkout", checkoutRoute);

router.use("/seller", sellerRoute);

router.get("/", (req, res) => {
    res.json({
        message: "you must be on /websaarthi"
    })
})

module.exports = router;