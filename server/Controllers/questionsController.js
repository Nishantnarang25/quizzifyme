import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getQuizById = async (req, res) => {
  const { quizId } = req.params;

  try {
    const quiz = await prisma.quizzes.findUnique({
      where: {
        id: Number(quizId),  // <-- query by ID (number)
      },
      include: {
        questions: true,
      },
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json({
      title: quiz.title,
      questions: quiz.questions,
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Server error fetching quiz' });
  }
};

export { getQuizById };


