const { Order, Account, Product, Seller } = require("../db");

const processCheckout = async (req, res) => {
  try {
    const userId = req.userId;

    const account = await Account.findOne({ userId }).populate("productsInCart.productId");
    if (!account) {
      return res.status(400).json({ message: "Account Doesn't Exist" });
    }

    if (account.productsInCart.length === 0) {
      return res.status(400).json({ message: "Your Cart is empty!" });
    }

    const cartItems = [];
    let totalAmount = 0;

    for (const item of account.productsInCart) {
      if (!item.productId) continue;

      const { _id, price } = item.productId;
      const quantity = item.quantity;

      cartItems.push({
        productId: _id,
        quantity,
        price,
      });

      totalAmount += price * quantity;
    }

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "No valid products found in cart" });
    }

    const order = new Order({
      user: userId,
      products: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount,
      paymentStatus: "Completed",
      orderStatus: "Processing",
    });

    await order.save();

    // Single loop to update both seller and buyer account
    for (const item of cartItems) {
      const product = await Product.findById(item.productId).populate("seller");

      // Update seller's buyerInteractions and stats
      if (product && product.seller) {
        const sellerUserId = product.seller._id;

        await Seller.findOneAndUpdate(
          { userId: sellerUserId },
          {
            $push: {
              buyerInteractions: {
                userId,
                productId: product._id,
                quantity: item.quantity,
                purchaseDate: new Date(),
                orderId: order._id,
                shipped: false,
              },
            },
            $inc: {
              totalSales: item.quantity,
              earnings: item.price * item.quantity,
            },
          }
        );
      }

      // Update buyer's productsBought list
      account.productsBought.push({
        productId: item.productId,
        quantity: item.quantity,
        purchaseDate: new Date(),
      });
    }

    // Clear cart and save buyer's account
    account.productsInCart = [];
    await account.save();

    res.status(201).json({
      message: "Order placed successfully!",
      order,
    });
  } catch (err) {
    console.error("Checkout Error", err);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = { processCheckout };
