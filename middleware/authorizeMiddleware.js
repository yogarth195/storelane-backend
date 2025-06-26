const jwt = require("jsonwebtoken")
require("dotenv").config();
const jwt_secret= process.env.JWT_SECRET;


const authorizeMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        try {
            const decoded = jwt.verify(token, jwt_secret);
            req.userId = decoded.userId;
            req.role = decoded.role;

            if (
                !Array.isArray(req.role) ||
                !allowedRoles.some((role) => req.role.includes(role))
            ) {
                return res
                .status(403)
                .json({ message: "Forbidden: insufficient privileges" });
            }

            next();
        } catch (err) {
            return res.status(401).json({ message: "Token invalid or expired" });
        }
    };
};
module.exports = authorizeMiddleware;