import User from "../models/User.js";
import jwt from "jsonwebtoken";

export async function signup(req, res) {
    const {email,password,fullName} = req.body;

    try {

        if(!email || !password || !fullName) {
            return res.status(400).json({ message: "Tous les champs sont requis"});
        }

        if(password.length < 6) {
            return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères"});
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Le format de l'email est invalide" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Cet email est déjà utilisé" });
        }

        const idx = Math.floor(Math.random() * 100) + 1;
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        const newUser = await User.create({
            email,
            fullName,
            password,
            profilePic: randomAvatar,
        });

        const token = jwt.sign({userId:newUser._id},process.env.JWT_SECRET_KEY, {
            expiresIn: "7d"
        });

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true, // prevent XSS attacks
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
        });

        res.status(201).json({success:true, user:newUser});

    }catch(error) {
        console.log("Error in signup Controller", error);
        res.status(500).json({ message: "Internal Server Error"});
    }
}
export async function login(req, res) {
    res.send("Login Route");
}
export function Logout(req, res) {
    res.send("Logout Route");
}