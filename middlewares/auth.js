const jwt = require('jsonwebtoken');
const User = require('../models/user');


const auth = async (req, res, next) => {
    try {
        // const {token} = req.cookies;

        const token = req.header("Authorization");

        if (!token) return res.send("Access denied. No token Provided");

        let decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const { id } = decoded;

        const user = await User.findById(id);
        if (!user) return res.send("Access denied.");

        req.user = user;

        next();

    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: err.message });
    }
}



module.exports = auth;