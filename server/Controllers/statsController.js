import prisma from "./../library/prisma.js";

export const getUserQuizStats = async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const quizzesCreated = await prisma.quizzes.count({
      where: { user_id: userId },
    });

    const totalAttempts = await prisma.attempts.count({
      where: { user_id: userId },
    });

    const wins = await prisma.attempts.count({
      where: { user_id: userId, status: true },
    });

    const winRatio = totalAttempts > 0 ? Math.round((wins / totalAttempts) * 100) : 0;

    res.json({
      quizzesCreated,
      totalAttempts,
      winRatio
    });

  } catch (err) {
    res.status(500).json({ message: "Error fetching stats", error: err });
  }
};
