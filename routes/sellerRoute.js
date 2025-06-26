const express = require("express")
const router = express.Router();

const sellerController = require("../controllers/sellerController");
const requireSeller = require("../middleware/requireSeller");
const checkProductOwnerShip = require("../middleware/checkProductOwnership");
const authorizeMiddleware = require("../middleware/authorizeMiddleware");

// Public test route; 

router.get("/", (req, res) => {
    return res.status(200).json({
        message: "You are on the seller page. please register to become a seller",
    });
})


// register seller:
router.post("/register", authorizeMiddleware("buyer", "seller"), sellerController.registerSeller);

// create a product (single product);
router.post("/product", requireSeller, sellerController.createProduct);

// bulk upload products:
router.post("/products/bulk", requireSeller, sellerController.bulkUploadProducts);

// update product details:
router.get(
"/product/:id",
requireSeller,
checkProductOwnerShip,
    sellerController.getProduct
);

// above is get, just get the product.
router.put(
    "/product/:id",
    requireSeller,
    checkProductOwnerShip,
    sellerController.updateProduct
);


// main dashBoard and Products in the sidebar frontend.
router.get("/dashboard", requireSeller, sellerController.getDashboard);

// Orders Route.
router.get('/orders', requireSeller, sellerController.getSellerOrders);
router.put("/mark-shipped", requireSeller, sellerController.markAsShipped);


// Customers. 
// Messages.
// Notifactions.
// Settings.

// Upload a product that is above, edit product all are above. 


module.exports = router;
