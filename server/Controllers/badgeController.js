import prisma from "./../library/prisma.js";

export const getAllBadges = async (req, res) => {
  try {
    const badges = await prisma.badges.findMany();
    res.json(badges);
  } catch (err) {
    res.status(500).json({ message: "Error fetching badges", error: err });
  }
};
