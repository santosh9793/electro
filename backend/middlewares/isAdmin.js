import jwt from "jsonwebtoken";

//get data with jwt authentication 
const isAdmin = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (typeof authorization !== 'undefined') {
        const bearer = authorization.split(' ');
        const token = bearer[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
            if (err) {
                res.status(401).json({ success: false, message: err })
            } else {
                if (decoded.role == 1) {
                    next();
                } else {
                    res.status(401).json({ success: false, message: "Not authorized as an admin" });
                }
            }
        })
    } else {
        res.status(401).json({ success: false, message: "Token Mismatched" });
    }
}

export default isAdmin;