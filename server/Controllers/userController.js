import prisma from "./../library/prisma.js";
import { generateToken } from "./../config/generateToken.js";

const INITIAL_XP = 0;

export const createUser = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        let user = await prisma.users.findUnique({
            where: { email: email }
        });

        if (!user) {
            user = await prisma.users.create({
                data: {
                    email: email,
                    badges: [],
                    xp: INITIAL_XP,
                }
            });
        }

        const token = generateToken(user.id);
        const takenUsernames = await fetchUsernames();

        res.json({
            message: "User created",
            id: user.id,
            email: user.email,
            username: user.username || null,
            xp: user.xp,
            badges: user.badges,
            token: token,
            takenUsernames: takenUsernames,
            profileCompleteStatus: user.profileCompleteStatus
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "User not created" });
    }
};

export const updateUser = async (req, res) => {
    const { username, email } = req.body;

    if (!username || !email) {
        return res.status(400).json({ message: "Username and Email are required" });
    }

    const badge = "Welcome Aboard!";

    try {
        const updatedUser = await prisma.users.update({
            where: { email: email },
            data: {
                username: username,
                badges: {
                    push: badge
                },
                xp: {
                    increment: 25
                },
                profileCompleteStatus: true
            }
        });

        res.json({
            message: "User updated",
            updatedUser
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "User not updated" });
    }
};

const fetchUsernames = async () => {
    try {
        const takenUsernames = await prisma.users.findMany({
            select: {
                username: true
            }
        });
        return takenUsernames || [];
    } catch (error) {
        console.error("Error fetching usernames", error);
        return [];
    }
};


export const getUserProfile = async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        xp: true,
        badges: true
      }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user", error: err });
  }
};