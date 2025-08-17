import jwt from "jsonwebtoken";

export const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: "30d"
    })
}

//this basically return a random string generated using jwt.sign (payload) and a secret key 