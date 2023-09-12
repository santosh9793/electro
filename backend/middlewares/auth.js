import jwt from "jsonwebtoken";

//get data with jwt authentication 
const authenticate = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (typeof authorization !== 'undefined') {
        const bearer = authorization.split(' ');
        const token = bearer[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
            if (err) {
                res.status(401).json({ success: false, message: err })
            } else {
                next();
            }
        })
    } else {
        res.status(401).json({ success: false, message: "Token Mismatched" });
    }
}

export default authenticate;