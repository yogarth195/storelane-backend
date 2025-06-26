require("dotenv").config();
const jwt_secret = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({message: "no token provided or invalid token"});
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, jwt_secret);
        req.userId = decoded.userId;
        next();
    } catch(err) {
        return res.status(403).json({
            message: "Token verification failed by authMiddleware"
        })
    }
};

module.exports = authMiddleware;