require("dotenv").config();
const jwt_secret = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken")
const { Seller, Product, User, Order } = require("../db");
const {Types} = require('mongoose');

//  Register Seller,  in register seller remember to update the token bcs your earlier token had job roles as buyer now it has seller also, the token on the localStorage remains the same, fix that by updating the token, we have generated a new  token below and returning that as a reponse:
const registerSeller = async (req, res) => {
  try {
    const user = await User.findById(req.userId); // from middleware
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role.includes("seller")) {
      return res.status(400).json({ message: "Already registered as a seller" });
    }

    const { storeName } = req.body;
    if(!storeName) {
      return res.status(400).json({
        message: "storeName is required in the body!"
      })
    }



    
    const newSeller = await Seller.create({
      userId: user._id,
      storeName,
      products: [],
      buyerInteractions: [],
      earning: 0,
      totalSales: 0,
    });

    user.role.push("seller");
    await user.save();


    // Refetch updated role. 
    const updatedUser = await User.findById(user._id);

    const token = jwt.sign(
      { userId: updatedUser._id, role: updatedUser.role },
      jwt_secret,
      { expiresIn: "1d" },
    );

    res.status(201).json({
      message: "Seller profile created, Please update the token",
      sellerId: newSeller._id,
      token, 
    });
  } catch (err) {
    res.status(500).json({ message: "Register failed", error: err.message });
  }
};


//  Create Product
const createProduct = async (req, res) => {
  try {
    const { name, price, imageUrl, description, category, sub_categories, units } = req.body;

    if(!name || !price || !category || !units) {
        return res.status(400).json({
          message: "missing required product fields"
        })
    }


    const seller = await Seller.findOne({
      userId: req.userId
    })

    if(!seller) {
      return res.status(404).json({
        message: "Seller ID not found"
      })
    }




    const product = await Product.create({
      name,
      price,
      imageUrl,
      description,
      category,
      sub_categories,
      units,
      seller: req.userId,
    });

    
    seller.products.push(product._id);
    await seller.save();

    res.status(201).json({ message: "Product created", product });
  } catch (err) {
    res.status(500).json({ message: "Create product failed", error: err.message });
  }
};


// Bulk Upload Products
const bulkUploadProducts = async (req, res) => {
  try {
    const productsData = req.body;

    const products = await Product.insertMany(
      productsData.map((p) => ({ ...p, seller: req.userId }))
    );

    const seller = await Seller.findOne({ userId: req.userId });
    seller.products.push(...products.map((p) => p._id));
    await seller.save();

    res.status(201).json({ message: "Bulk products uploaded", products });
  } catch (err) {
    res.status(500).json({ message: "Bulk upload failed", error: err.message });
  }
};


// Get Product
const getProduct  = async(req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if(!product) return res.status(404).json({message: "Product Not Found"});

    res.status(200).json({
      message:"here is your product",
      product
    })
  } catch(err) {
    res.status(500).json({ message: "Error finding product", error: err.message });
  }
}



// Update Product
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const update = req.body;

    const product = await Product.findByIdAndUpdate(productId, update, { new: true });

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ message: "Product updated", product });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

// Seller Dashboard
const getDashboard = async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.userId })
      .populate("products")
      .populate({
        path: 'buyerInteractions.userId',
        select: 'name email' //projecting only what we need
      })
      .populate({
        path: 'buyerInteractions.productId',
        select: 'name price imageUrl'  // only needed product fields
      })
      .lean();

    if (!seller) return res.status(404).json({ message: "Seller not found" });

    res.status(200).json({
      storeName: seller.storeName,
      products: seller.products,
      totalSales: seller.totalSales,
      earning: seller.earnings,
      buyerInteractions: seller.buyerInteractions,
    });
  } catch (err) {
    res.status(500).json({ message: "Dashboard fetch failed", error: err.message });
  }
};



// getting the buyer interactions: 
const getSellerOrders = async (req, res) => {
  try {
    const seller = await Seller.findOne({
      userId: req.userId
    }).populate({
      path: 'buyerInteractions.userId',
      select: 'name email'
    }).populate({
      path: 'buyerInteractions.productId',
      select: 'name imageUrl price', 
    });


    if(!seller) {
      return res.status(404).json({
        message: "Seller Not Found"
      })
    }


    return res.status(200).json({
      buyerInteractions: seller.buyerInteractions,
      earning: seller.earning,
    });
  } catch(err) {
    console.error("Fetch seller orders error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
// Route to mark product as shippped:

const markAsShipped = async (req, res) => {
  try {
    const { orderId, productId } = req.body;

    // Step 1: Update seller's buyerInteractions array
    const updatedSeller = await Seller.findOneAndUpdate(
      {
        userId: req.userId,
        "buyerInteractions.orderId": new Types.ObjectId(orderId),
        "buyerInteractions.productId": new Types.ObjectId(productId),
      },
      {
        $set: {
          "buyerInteractions.$.shipped": true,
        },
      },
      { new: true }
    );

    if (!updatedSeller) {
      return res.status(404).json({
        message: "Order or ProductId not found in seller interactions",
      });
    }

    // Step 2: Update status inside the Order.products array
    const orderUpdateResult = await Order.updateOne(
      {
        _id: new Types.ObjectId(orderId),
        "products.productId": new Types.ObjectId(productId),
      },
      {
        $set: {
          "products.$.status": "shipped",
        },
      }
    );


    return res.status(200).json({
      message: "Marked as Shipped",
    });
  } catch (err) {
    console.error("Mark as shipped error", err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};







module.exports = {
  registerSeller,
  createProduct,
  bulkUploadProducts,
  getProduct,
  updateProduct,
  getDashboard,
  getSellerOrders,
  markAsShipped,
};
