const express = require("express");
const router = express.Router();
const { Product, User, Account } = require("../db");
const authMiddleware = require("../middleware/authenticateMiddleware");

router.get("/", async (req, res) => {
    const { sortBy, order, query, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    try {
        let filter = {};

        if (query) {
            filter = {
                $or: [
                    { name: { $regex: query, $options: "i" } },
                    { category: { $regex: query, $options: "i" } },
                    { sub_categories: { $regex: query, $options: "i" } },
                ],
            };
        }

        let sortOptions = {};
        if (sortBy) {
            const sortOrder = order === 'desc' ? -1 : 1;
            sortOptions[sortBy] = sortOrder;
        }

        const totalCount = await Product.countDocuments(filter);

        const products = await Product.find(filter)
            .sort(sortOptions)
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .exec();

        res.json({
            products,
            totalCount,
            page: pageNum,
            limit: limitNum,
        });
    } catch (err) {
        res.status(500).json({
            message: "Error fetching products",
            error: err,
        });
    }
});



router.get("/:productId/:productName", async (req, res) => {
    const { productId, productName } = req.params;
    
    try {
        const product = await Product.findOne({ _id: productId }).populate("seller", "firstName lastName username");
        
        if (!product) {
            return res.status(404).json({
                message: "Product Not found",
            });
        }

        if (product.name.toLowerCase() !== productName.toLowerCase()) {
            return res.status(404).json({
                message: "Product name mismatch",
            });
        }

        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({
            message: "Server Error, Cannot fetch the products due some reason",
        });
    }
});

router.post("/:productId/:productName/review", authMiddleware, async(req, res)  => {
    const {productId, productName} = req.params;
    const {rating, comment} = req.body;
    
    

    if(!rating || !comment) {
        return res.status(400).json({ message: "All fields are required (name, rating, comment)" });
    }

    try {
        const product = await Product.findOne({_id: productId});

        if(!product) {
            return res.status(404).json({
                message: "Product Not Found"
            })
        }

        if(product.name.toLowerCase() !== productName.toLowerCase()) {
            return res.status(400).json({
                message: "Product Name mismatch"
            })
        }


        const user = await User.findById(req.userId);
        if(!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }


        // Check if the user has bought the product or not.
        const account = await Account.findOne({userId: req.userId});
        const hasBought = account.productsBought.some((item) =>
            item.productId.equals(productId)
        );



        if (!hasBought) {
            return res.status(403).json({
                message: "Only users who have purchased the product can leave a review",
            });
        }

        
        const newReview = {
            user: req.userId,
            name: user.firstName + " " + (user.lastName || ""),  // or just username
            rating: parseInt(rating),
            comment,
            createdAt: new Date(),
        };


        product.reviews.push(newReview);
        await product.save();

        return res.status(200).json({
            message: "Review Added Successfully", review: newReview
        })
    } catch(err) {
        
        
        return res.status(500).json({ message: "Failed to add review", error: err.message });
        
    }
})

router.get("/:id([a-fA-F0-9]{24})", async(req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch product", error: err.message });

    }
})


router.get("/search", async (req, res) => {
    try {
        const query = req.query.q || "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortBy = req.query.sortBy || "name"; // name or price
        const order = req.query.order === "desc" ? -1 : 1;

        const filter = {
            $or: [
                { name: { $regex: query, $options: "i" } },
                { category: { $elemMatch: { $regex: query, $options: "i" } } },
                { sub_categories: { $elemMatch: { $regex: query, $options: "i" } } }
            ]
        };

        const totalCount = await Product.countDocuments(filter);

        const products = await Product.find(filter)
            .sort({ [sortBy]: order })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        return res.status(200).json({ products, totalCount, page, limit });
    } catch (err) {
        return res.status(500).json({ message: "Internal server error." });
    }
});





module.exports = router;
