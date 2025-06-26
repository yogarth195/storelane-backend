//This is the profile route.. 
require("dotenv").config();
const express = require("express");
const router = express.Router();
const { User, Account } = require("../db");
const jwt = require("jsonwebtoken");
const jwt_secret = process.env.JWT_SECRET;
const authMiddleware = require("../middleware/authenticateMiddleware");
const bcrypt = require("bcrypt");

router.get("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;

        // Fetch user details
        const user = await User.findById(userId).select("-password"); // Exclude sensitive fields like password
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch account details
        const account = await Account.findOne({userId});
        if(!account) {
            return res.status(404).json({ message: "Account Not Found/ Not created" });
        }
        

        // Combine and return user and account details
        return res.status(200).json({
            user: {
                username: user.username,
                first_name: user.firstName,
                last_name: user.lastName,
            },
            account: {
                productBought: account.productsBought,
                productInCart: account.productsInCart,
                productWishlist: account.productsWishlist,
            },
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// To add: changing password is done below, add a change userName and other credentials that can be changed. 

router.put("/changePassword", authMiddleware, async(req, res) => {
    const {currentPassword, newPassword} = req.body;
    if(!currentPassword || !newPassword ) {
        return res.json({
            message: "Current and New Password both are required. "
        })
    }


    try {
        const user = await User.findById(req.userId);
        if(!user) {
            return res.status(404).json({
                message: "User not found."
            })
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if(!isMatch) {
            return res.status(401).json({
                message: "Current Password is incorrect"
            })
        }

        // Hashing the new password: 
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        //updating the new user. 
        user.password = hashedPassword;
        await user.save();

        return res.json({
            message: "Password changed successfully."
        })
    } catch(err) {
        return res.json({
            message: "Something wrong in updating the password. "
        })
    }
})


module.exports = router;