import prisma from "./../library/prisma.js";

export const createAttempt = async (req, res) => {
  const { user_id, quiz_id, answers } = req.body;

  if (!user_id || !quiz_id || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Missing data' });
  }

  try {
    // 1. Count correct answers
    const score = answers.filter((ans) => ans.is_correct).length;
    const total_questions_attempted = answers.length;

    // 2. Create attempt
    const attempt = await prisma.attempts.create({
      data: {
        user_id,
        quiz_id,
        score,
        total_questions_attempted,
        status: true,
      },
    });

    // 3. Create all answers
    const attemptAnswersData = answers.map((ans) => ({
      question_id: ans.question_id,
      attempt_id: attempt.id,
      selected_answer: ans.selected_answer,
      is_correct: ans.is_correct,
    }));

    await prisma.attempt_answers.createMany({
      data: attemptAnswersData,
    });

    // 4. Fetch user
    const user = await prisma.users.findUnique({ where: { id: user_id } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 5. XP calculation (Example: 10 XP per correct answer)
    const gainedXP = score * 10;
    let newXP = (user.xp || 0) + gainedXP;

    // 6. Load current badges (string array)
    let badges = user.badges || [];

    // 7. Badge conditions

    // First Blood - first quiz completed
    if (badges.indexOf("First Blood") === -1) {
      const attemptsCount = await prisma.attempts.count({ where: { user_id } });
      if (attemptsCount === 1) badges.push("First Blood");
    }

    // Quiz Champ - score above 80% in 5 quizzes
    if (!badges.includes("Quiz Champ")) {
      const passedHighScoreCount = await prisma.attempts.count({
        where: {
          user_id,
          score: { gte: Math.ceil(total_questions_attempted * 0.8) },
        },
      });
      if (passedHighScoreCount >= 5) badges.push("Quiz Champ");
    }

    // Flawless Victory - 100% score in a quiz
    if (score === total_questions_attempted && !badges.includes("Flawless Victory")) {
      badges.push("Flawless Victory");
    }

    // (Add more badges here based on rules — e.g. Streak Master, Speedster, etc.)

    // 8. Update user with new XP and badges (removing duplicates)
    badges = [...new Set(badges)]; // remove duplicates if any

    await prisma.users.update({
      where: { id: user_id },
      data: {
        xp: newXP,
        badges,
      },
    });

    // 9. Respond with attempt + updated user info
    res.status(201).json({
      message: 'Attempt saved successfully',
      attempt_id: attempt.id,
      score,
      total_questions_attempted,
      quiz_id,
      user_id,
      status: attempt.status,
      user_xp: newXP,
      user_badges: badges,
    });

  } catch (error) {
    console.error('Error saving attempt:', error);
    res.status(500).json({ error: 'Failed to save attempt' });
  }
};
