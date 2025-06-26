import { upsertStreamUser } from "../lib/stream.js";
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

        try {
            await upsertStreamUser({
            id:newUser._id.toString(),
            name:newUser.fullName,
            image: newUser.profilePic || "",
        });
        console.log(`Stream user created for ${newUser.fullName}`);
        } catch (error) {
            console.log("Error creating Strem user:", error);
        }

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
    try {
        const { email, password } = req.body;
        if(!email || !password) {
            return res.status(400).json({ message: "Tous les champs sont requis"});
        };

        const user = await User.findOne({ email});
        if(!user) {
            return res.status(401).json({ message: "Identifiant ou mot de passe invalide"});
        };

        const isPasswordCorrect = await user.matchPassword(password);
        if(!isPasswordCorrect) {
            return res.status(401).json({ message: "Identifiant ou mot de passe invalide"});
        };

        const token = jwt.sign({userId:user._id},process.env.JWT_SECRET_KEY, {
            expiresIn: "7d"
        });

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true, // prevent XSS attacks
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
        });

        res.status(200).json({success: true, user});

    } catch(error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}
export function Logout(req, res) {
    res.clearCookie("jwt");
    res.status(200).json({ success: true, message: "Déconnexion réussie"});
}