import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../config/jwt.config.js';

export const register = async (req, res) => {
    try {
        // console.log("check req body:", req.body);
        const { email, password, username } = req.body;
        if(!email || !password || !username){
            return res.status(400).json({ message: 'Missing input parameters' });
        }
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            email,
            password: hashedPassword,
            username
        });

        const refreshToken = generateRefreshToken(user.id, user.role);
        const accessToken = generateAccessToken(user.id, user.role);

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({ errCode: 0, message: 'Signup succeed!', role: user.role,token: accessToken });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const user = await User.findOne({ email });
        if (!user || user.status !== "active") {
            return res.status(404).json({ message: 'User not found or unauthorized' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const refreshToken = generateRefreshToken(user.id, user.role);
        const accessToken = generateAccessToken(user.id, user.role);

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({ errCode: 0, message: 'Login succeed!', role: user.role,token: accessToken });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const refresh = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' });

    const refreshToken = cookies.jwt;
    const user = verifyRefreshToken(refreshToken);
    // console.log("check user on refresh token:", user);
    if(user){
        const accessToken = generateAccessToken(user.id, user.role);
        res.status(200).json({token: accessToken});
    }else{
        res.status(401).json({ message: 'Unauthorized becaused invalid token' });
    };

}
export const logout = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies.jwt) return res.sendStatus(204);
    res.clearCookie('jwt', {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
    });
    return res.status(200).json({errCode: 0, message: 'Cookie cleared, logout successfully'});
}