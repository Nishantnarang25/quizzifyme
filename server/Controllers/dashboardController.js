import prisma from "./../library/prisma.js";

export const getDashboardData = async (req, res) => {
  const { username } = req.params;

  try {
    // 1. Fetch user with quizzes and attempts
    const user = await prisma.users.findUnique({
      where: { username },
      include: {
        quizzes: {
          include: {
            attempts: {
              include: {
                user: {
                  select: {
                    username: true,
                  },
                },
              },
              orderBy: { created_at: "desc" },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2. Fetch all badges
    const allBadges = await prisma.badges.findMany();

    // 🔥 FIX: Match by name, not ID
    const earnedBadgeNames = user.badges || [];

    const earnedBadges = allBadges.filter((b) =>
      earnedBadgeNames.includes(b.name)
    );

    const lockedBadges = allBadges.filter(
      (b) => !earnedBadgeNames.includes(b.name)
    );

    // 3. Return structured response
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        xp: user.xp,
      },
      earnedBadges,
      lockedBadges,
      allBadges,
      quizzes: user.quizzes,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
