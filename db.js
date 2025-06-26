const mongoose = require("mongoose");
require("dotenv").config(); // Load .env variables

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

  
//this is having all the models. 

//the product schema.
const productSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true,
        default: 'https://scontent.fdel34-1.fna.fbcdn.net/v/t39.30808-6/465888068_8823197481059808_4949974108549077179_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=tE-3QutFTCMQ7kNvgG_XTvm&_nc_zt=23&_nc_ht=scontent.fdel34-1.fna&_nc_gid=ASfX2gmONP-PJpWjRfgxC_J&oh=00_AYDa1PMPF7BDo4k3J3wRowJ_8WZLMf23bL-7hTxcx4gXwA&oe=6797CD9B'//change this to the path that should be seen on the screen.
    },
    price: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
        maxLength: [40, "Name should not be more than 40 characters"],
    }, 
    description: {
        type: String,
        required: true,
        default: function() {
            return `No description is provided for the ${this.name}.`; //default description is the name
        }
    }, 
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true,
        required: true,
        unique: true,
    },
    units: {
        type: Number,
        required: true, 
        default: 0, 
    },
    category: {
        type: [String], 
        required: true,
        default: [],
    },
    sub_categories: {
        type: [String], 
        required: true,
        default: [],
    },

    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    reviews: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User", 
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true,
                min: 1,
                max: 5
            },
            comment: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
    }, 
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50,
    }, 
    lastName: {
        type: String,
        // required: false, //this is something I did on my own, lets see its consequences. 
        trim: true,
        maxLength: 50,
    },
    role : {
        type: [String],
        enum: ["buyer", "seller", "admin"],
        default: ["buyer"],
    }, 
});

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, //reference to the user Model
        ref: 'User', 
        required: true
    },

    isSeller: {
        type: Boolean,
        default: false,
    },

    address: {
        houseNo: String,
        street: String,
        city: String,
        state: String,
        country: String,
        zip: String,
    },

    phone: {
        type: String,
        default: "",
    },
    
    productsInCart : [{
        productId: {type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
        quantity: {type: Number, default: 1},
    }], 
    productsBought: [{
        // WHENEVER A PRODUCTS IS BOUGHT, THAT SHOULD BE A SESSION CALL, MEANING WHEN A PRODUCTS IS RENDERED HERE AS BOUGHT, IT  SHOULD BE DEDCUTED FROM THE BACKEND SERVER.
        productId: {type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
        purchaseDate: {type: Date, default: Date.now},
        quantity: {type: Number, default: 1},
    }],
    productsWishlist: [{
        //this should store the products which are zero in no. of units. and when these products are available to be bought it should render add to wish list rather than buy. 
        productId: {type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
    }],
});


const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Assuming you have a User model
        required: true
    },
    products: [
        {
          productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
          quantity: Number,
          price: Number,
          status: {
            type: String,
            enum: ["yet-to-ship", "shipped", "delivered"],
            default: "yet-to-ship",
          }
        },
    ],
    totalAmount: { type: Number, required: true },
    paymentStatus: { 
        type: String, 
        enum: ["Pending", "Completed", "Failed"], 
        default: "Pending" 
    },
    orderStatus: { 
        type: String, 
        enum: ["Processing", "Shipped", "Delivered", "Cancelled"], 
        default: "Processing" 
    },
    createdAt: { type: Date, default: Date.now }
});






const sellerSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    storeName: {
        type: String, 
        required: true,
    },
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }
    ],

    buyerInteractions: [
        {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        purchaseDate: Date,
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, 
        shipped: { type: Boolean, default: false}, 
        }
    ],

    // Sales Data:
    totalSales : {
        type: Number,
        default: 0,
    },
    earnings: {
        type: Number, 
        default: 0,
    },


    // Trends: 
    trends: {
        topSellingProducts: [{
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Product',
        }],
        mostActiveBuyers: [{
            type: mongoose.Schema.Types.ObjectId,
        }],
    },


    // Ratings: 
    ratings: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, 
            rating: Number,
            review: String,
            buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            data: { type: Date, default: Date.now },
        }
    ],

    createdAt: { type: Date, default: Date.now },
});




const Order = mongoose.model('Order', orderSchema);
const Product = mongoose.model('Product', productSchema);
const Account = mongoose.model('Account', accountSchema);
const User = mongoose.model('User', userSchema);
const Seller = mongoose.model('Seller', sellerSchema);

module.exports  = {
    Product, 
    Account, 
    User,
    Order,
    Seller,
};
