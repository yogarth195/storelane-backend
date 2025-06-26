require("dotenv").config();
const express = require("express"); //express
const router = express.Router(); //for routing over different routes and pages. 
const zod = require("zod"); //zod for checking the input body. 
const { User, Account } = require("../db"); //using User model to create a new user, findOne and other uses. 
const jwt = require("jsonwebtoken"); //jwt library. 
// const { jwt_secret } = require("../config"); //for creating a token and checkig it. 
const authMiddleware = require("../middleware/authenticateMiddleware"); // Correct import
const bcrypt = require("bcryptjs");
const jwt_secret = process.env.JWT_SECRET;

// Getting the order that we bought.
const { getOrders } = require('../controllers/orderController');


const signupBody = zod.object({
    username: zod.string().email(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string(),
});
router.post("/signup", async (req, res) => {
    const { success } = signupBody.safeParse(req.body);
    if (!success) {
        return res.status(411).json({ message: "Incorrect inputs" });
    }

    const existingUser = await User.findOne({ username: req.body.username });

    if (existingUser) {
        return res.status(411).json({ message: "Email already taken" });
    }

    //hashing the password using bcryptjs
    const hashedPassword = await bcrypt.hash(req.body.password, 10);  

    const user = await User.create({
        username: req.body.username,
        password: hashedPassword, //storing the hashed password.
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    });

    const accountDetails = await Account.create({
        userId: user._id,
        productsInCart: [],
        productsBought: [],
        productsWishlist: [],
    })

    // const token = jwt.sign({ userId: user._id }, jwt_secret);
    // the above is a simpler token, which didn't take in account of the type of role, that is the role can be seller or buyer.

    const token = jwt.sign(
        { userId: user._id, role: user.role},
        jwt_secret,
        {expiresIn: "1d"},
    )

    // Set custom header with myObj
    // res.setHeader("myObj", JSON.stringify({ someData: "value" }));
    res.setHeader("myObj", "someValue");
    res.json({ message: "User created", token });
});

const signInBody = zod.object({
    username: zod.string().email(),
    password: zod.string()
})
router.post("/signin", async(req, res) => {
    const {success} = signInBody.safeParse(req.body);
    if(!success) {
        return res.status(400).json({
            message: "incorrect inputs"
        })
    }

    //now finding the user via the username provided. 
    const user = await User.findOne({username: req.body.username});

    if(!user) {
        return res.status(404).json({
            message: "user not found"
        });
    }

    const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);

    // if(user.password !== req.body.password) {
    //     return res.status(401).json({
    //         message: "incorrect password"
    //     });
    // }
    //the above code is the code when no hashing. below the hashedpassword check. 
    
    if(!isPasswordCorrect) {
        return res.status(401).json({message: "Incorrect password"});
    }

    // Generate a token
    //now user is found with the correct password thus token generation. 
    //now since we are there then must the password and username is correct. 


    const token = jwt.sign(
        { userId: user._id, role: user.role },
        jwt_secret,
        { expiresIn : "1d"},
    )
    

    // if we hadn't returned yet this means login wasn't correct
    res.json({
        message: "Login Successful", 
        token: token
    })
})

router.get("/me", authMiddleware, async (req, res)=> {
    try {
        const user = await User.findById(req.userId).select("-password") //Excluding password. 
        if(!user) {
            return res.status(404).json({
                message: "User Not Found"
            });
        }
        res.json({
            message: "User authenticated", 
            user, 
        });
    } catch(err) {
        res.status(500).json({
            message: "Something went wrong, probably the database is down", err: err.message
        });
    }
})


// Getting the  orders:
router.get("/myOrders", authMiddleware, getOrders)

module.exports = router;
