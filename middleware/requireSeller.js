const authorizeMiddleware = require("./authorizeMiddleware")


const requireSeller = authorizeMiddleware("seller");


module.exports = requireSeller;