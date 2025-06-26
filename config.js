//this the jwt_secret file, meaning only who has this can authenticate whether the provided Jwt token is correct or not.
const jwt_secret = process.env.JWT_SECRET;
module.exports = {
    jwt_secret,
}


