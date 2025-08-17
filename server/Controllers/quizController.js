import prisma from "./../library/prisma.js";

const slugify = (text) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');


export const createQuiz = async (req, res) => {
    const { title, timeAlloted, user_id } = req.body;
    console.log(title, timeAlloted, user_id)

    try {
        const quiz = await prisma.quizzes.create({
            data: {
                title: title,
                time_alloted: timeAlloted,
                user_id: user_id,
                is_verified: true,
                total_questions: 0
            }
        })
        res.json(quiz)
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: "Quiz not created" });
    }
}

export const finalizeQuiz = async (req, res) => {
    const { quizId, createdBy, title, timeAlloted, totalQuestions, questions } = req.body;

    // Generate URL like quiz/{createdBy}/{quizId} (using exact quizId from DB)
    const generatedUrl = `quiz/${createdBy}/${quizId}`;  // simplified URL

    try {
        // Update quiz record
        await prisma.quizzes.update({
            data: {
                total_questions: totalQuestions,
                share_url: generatedUrl,
                time_alloted: timeAlloted,
                generated_slug_id: slugify(title),  // optional, can keep or remove this
            },
            where: {
                id: quizId,
            }
        });

        // Insert questions
        const createdQuestions = await prisma.questions.createMany({
            data: questions.map((q) => ({
                quiz_id: quizId,
                question: q.question,
                options: q.options,
                correct_answer: q.correctAnswer,
            }))
        });

        res.status(200).json({
            message: 'Quiz finalized successfully',
            shareUrl: generatedUrl,  // This is now /quiz/{createdBy}/{quizId}
            createdQuestions,
        });

    } catch (err) {
        console.error('Error finalizing quiz:', err);
        res.status(500).json({ error: 'Failed to finalize quiz' });
    }
};


export const getQuizzesByUsername = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await prisma.users.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const quizzes = await prisma.quizzes.findMany({
      where: { user_id: user.id },
      include: {
        questions: true, // ✅ includes all columns from the Questions table
      },
    });

    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching user quizzes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getQuizById = async (req, res) => {
    const { quizId } = req.params;

    try {
        const quiz = await prisma.quizzes.findUnique({
            where: { id: parseInt(quizId) },
            include: {
                questions: true,
            }
        });

        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

        res.status(200).json(quiz);
    } catch (error) {
        console.error('Error fetching quiz:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateQuiz = async (req, res) => {
  const { quizId } = req.params;
  const { title, timeAlloted, questions } = req.body;

  try {
    // Update quiz metadata
    await prisma.quizzes.update({
      where: { id: parseInt(quizId) },
      data: {
        title,
        time_alloted: timeAlloted,
        total_questions: questions.length,
        generated_slug_id: slugify(title)
      }
    });

    for (const q of questions) {
      if (q.id) {
        // Update existing question
        await prisma.questions.update({
          where: { id: q.id },
          data: {
            question: q.question,
            options: q.options,
            correct_answer: q.correctAnswer
          }
        });
      } else {
        // Create new question
        await prisma.questions.create({
          data: {
            quiz_id: parseInt(quizId),
            question: q.question,
            options: q.options,
            correct_answer: q.correctAnswer
          }
        });
      }
    }

    res.status(200).json({ message: "Quiz updated successfully" });
  } catch (err) {
    console.error('Error updating quiz:', err);
    res.status(500).json({ error: 'Failed to update quiz' });
  }
};


