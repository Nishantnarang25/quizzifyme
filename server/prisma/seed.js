import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const badges = [
        {
            name: 'Quiz Champ',
            description: 'You rocked it by scoring over 80% in 5 quizzes! Keep that streak going!',
            image_url: '/badges/quiz_champ.png',
        },
        {
            name: 'Speedster',
            description: 'Zoom! You answered 10 questions in less than 5 seconds each. Speed king/queen!',
            image_url: '/badges/speedster.png',
        },
        {
            name: 'Streak Master',
            description: 'You’ve been on fire! Taking quizzes 3 days in a row — impressive dedication!',
            image_url: '/badges/streak_master.png',
        },
        {
            name: 'First Blood',
            description: 'Congrats on completing your very first quiz! The adventure begins here.',
            image_url: '/badges/first_blood.png',
        },
        {
            name: 'Flawless Victory',
            description: 'Perfect score alert! You nailed a quiz with 100% accuracy. Legend status!',
            image_url: '/badges/flawless_victory.png',
        },
        {
            name: 'Comeback Kid',
            description: 'Tough times don’t last! You bounced back after 3 losses and won 2 quizzes back-to-back.',
            image_url: '/badges/comeback_kid.png',
        },
        {
            name: 'Explorer',
            description: 'You’re curious! You’ve tried quizzes from 5 different topics. Keep exploring!',
            image_url: '/badges/explorer.png',
        },
        {
            name: 'Fast & Furious',
            description: 'You blitzed through a 10-question quiz in under a minute. Speed demon!',
            image_url: '/badges/fast_and_furious.png',
        },
        {
            name: 'Lucky Guess',
            description: 'That was close! You passed a quiz by just 1 point. Luck was on your side!',
            image_url: '/badges/lucky_guess.png',
        },
        {
            name: 'Legend',
            description: 'Wow, you earned 1000 XP! You’re becoming a true quiz legend.',
            image_url: '/badges/legend.png',
        },
    ];

    for (const badge of badges) {
        await prisma.badges.upsert({
            where: { name: badge.name },
            update: {},
            create: badge,
        });

    }

    console.log('Badges seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
