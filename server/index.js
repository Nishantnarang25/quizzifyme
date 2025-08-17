import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { Server } from "socket.io";
import http from "http";

//importing all Routes
import userRoutes from "./Routes/user.js";
import quizRoutes from "./Routes/quiz.js";
import questionsRoutes from "./Routes/questions.js";
import attemptRoutes from './Routes/attempt.js';
import badgeRoutes from './Routes/badge.js';
import dashboardRoutes from "./Routes/dashboard.js";
import axios from 'axios'
import { decode } from 'html-entities';
import prisma from './library/prisma.js';


const decodeHTML = decode;

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

//this is used to create a server, we wrap the app around the app
const server = http.createServer(app);

//Once server is created, we add the real-time powers to it by creating a socket
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
})

//using all routes here
app.use("/api/user", userRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/attempts", attemptRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
    res.send('Server is running!')
})

const rooms = {}; // ✅ Must be an object, NOT an array!

function startQuestionTimer(roomId) {
    const room = rooms[roomId];
    if (!room) return;

    const totalQuestions = room.questions.length;
    let index = 0;

    const interval = setInterval(() => {
        if (index >= totalQuestions) {
            clearInterval(interval);
            room.quizEnded = true;

            // 🏆 Collect participants and sort by score (desc)
            const sortedParticipants = Object.values(room.participants).sort((a, b) => b.score - a.score);

            // 🏅 Assign ranks and medals
            const rankings = sortedParticipants.map((p, i) => {
                let medal = null;
                if (i === 0) medal = 'gold';
                else if (i === 1) medal = 'silver';
                else if (i === 2) medal = 'bronze';

                return {
                    name: p.name,
                    user: p.user,
                    score: p.score,
                    medal,
                };
            });

            // Extract only the winners (top scorer(s))
            const topScore = rankings[0]?.score || 0;
            const winners = rankings.filter(r => r.score === topScore).map(r => r.name);

            // ✅ Log the final room data for debug
            console.log(`🛑 Final room state after quiz ends for room ${roomId}:`);
            console.dir(room, { depth: null });

            console.log(`🥇 Rankings for room ${roomId}:`);
            console.table(rankings);

            // ✅ Notify users quiz is over + send data
            io.in(roomId).emit("quizEnded", {
                room,
                winners,         // Array of names with top score
                rankings         // Full sorted array with medals
            });

            return;
        }

        const question = room.questions[index];

        // Send current index + question to everyone
        io.in(roomId).emit("nextQuestionIndex", {
            index,
            question: {
                question: question.question,
                options: question.options
            }
        });

        room.currentQuestionIndex = index;
        index++;
    }, 16000); // 15s for answer + 1s buffer
}



io.on("connection", (socket) => {
    console.log("🔌 New User Connected", socket.id);

    socket.on("createRoom", ({ user, name, roomId, quizCategory, isHost }) => {
        console.log("📥 createRoom received:", { name, roomId, quizCategory, isHost });

        if (rooms[roomId]) {
            console.warn("⚠️ Room already exists:", roomId);
            socket.emit("error", "Room already exists");
            return;
        }

        rooms[roomId] = {
            roomId,
            hostSocketId: socket.id,
            hostName: name,
            quizType: "multiple",
            quizCategory, // ✅ now it works correctly
            quizStarted: false,
            quizEnded: false,
            currentQuestionIndex: 0,
            totalQuestions: 10,
            createdAt: Date.now(),
            questions: [],
            participants: {
                [socket.id]: {
                    user,
                    name,
                    isHost: true,
                    score: 0,
                    answers: [],
                    joinedAt: Date.now(),
                },
            },
        };

        socket.join(roomId);

        console.log("✅ the updated rooms is ", rooms);

        socket.emit("roomCreated", {
            rooms,
            socketId: socket.id,
            roomId,
        });
    });


    socket.on("adminJoinedRoom", ({ roomId, socketId }) => {
        const room = rooms[roomId];

        if (!room) {
            return socket.emit("error", { message: "Room not found." });
        }

        socket.join(roomId);

        if (room.participants[socketId]) {
            console.log(`🔁 Participant [${socketId}] already present in room ${roomId}`);
        } else {
            room.participants[socketId] = {
                name: `User-${socketId.slice(0, 5)}`,
                isHost: socketId === room.hostSocketId,
                score: 0,
                answers: [],
                joinedAt: Date.now()
            };
            console.log(`👤 Added participant [${socketId}] to room ${roomId}`);
        }
        io.in(roomId).emit("adminInfo", {
            participants: room.participants,
            adminSocketId: room.hostSocketId,
        });


    });

    socket.on('joinRoomUsingCode', ({ user, name, roomId, socketId }) => {
        console.log(`User ${name} (${socketId}) is trying to join room: ${roomId}`);

        if (!roomId || !name) {
            socket.emit('error', 'Room ID and name are required');
            return;
        }

        // Room doesn't exist — reject
        if (!rooms[roomId]) {
            socket.emit('error', 'Room does not exist');
            return;
        }

        const room = rooms[roomId];

        // If quiz already started, prevent joining
        if (room.quizStarted) {
            socket.emit('error', 'Quiz already started. Cannot join.');
            return;
        }

        // Add participant
        room.participants[socket.id] = {
            user,
            name,
            isHost: false,
            score: 0,
            answers: [],
            joinedAt: Date.now(),
        };

        // Join the socket.io room
        socket.join(roomId);

        // Confirm join to this user
        socket.emit('roomJoined', {
            roomId,
            name,
        });

        // Optionally notify others in the room
        socket.to(roomId).emit('participantJoined', {
            socketId,
            name,
        });

        console.log(`User ${name} joined room ${roomId}`);
    });

    socket.on("startingQuiz", async ({ roomId }) => {
        const room = rooms[roomId];

        if (!room) {
            return socket.emit("error", { message: "Room not found" });
        }

        console.log(`🟡 startingQuiz triggered by admin in room ${roomId}`);

        const categoryId = room.quizCategory;

        if (!categoryId) {
            return socket.emit("error", { message: "Invalid quiz category selected." });
        }

        try {
            const apiURL = `https://opentdb.com/api.php?amount=10&category=${categoryId}&type=multiple`;
            const response = await axios.get(apiURL);
            const data = response.data;

            console.log("📦 Raw API data:", JSON.stringify(data, null, 2));

            if (data.response_code !== 0) {
                console.error("❌ Trivia API error: ", data.response_code);
                return socket.emit("error", { message: "Failed to fetch questions. Try a different category." });
            }

            const formattedQuestions = data.results.map((q) => {
                const options = [...q.incorrect_answers];
                const correctIndex = Math.floor(Math.random() * 4);
                options.splice(correctIndex, 0, q.correct_answer);

                return {
                    question: decodeHTML(q.question),
                    options: options.map(decodeHTML),
                    correctAnswerIndex: correctIndex,
                };
            });

            console.log("🧠 Formatted Questions:", formattedQuestions);

            // ✅ Store questions and update room state
            room.questions = formattedQuestions;
            room.quizStarted = true;
            room.currentQuestionIndex = 0;

            // ✅ Now notify participants with actual questions
            for (const participantId of Object.keys(room.participants)) {
                console.log(`📤 Sending quizStartedByAdmin to ${participantId}`);
                io.to(participantId).emit('quizStartedByAdmin', {
                    questions: formattedQuestions,
                    roomId,
                    adminSocketId: room.hostSocketId,
                });
            }

            // ✅ Emit sanitized version to everyone (no answers)
            io.in(roomId).emit("sendQuestions", {
                questions: formattedQuestions.map(q => ({
                    question: q.question,
                    options: q.options
                }))
            });

            // ✅ Start timer
            startQuestionTimer(roomId);

            console.log(`✅ Quiz started in room ${roomId} and questions sent`);
        } catch (error) {
            console.error("❌ Failed to fetch questions:", error.message);
            socket.emit("error", { message: "Failed to fetch questions." });
        }
    });


    socket.on("submitAnswer", ({ roomId, questionIndex, selectedOption }) => {
        const room = rooms[roomId];
        if (!room) return;

        const participant = room.participants[socket.id];
        if (!participant) return;

        // Store selected answer
        participant.answers[questionIndex] = selectedOption;

        // ✅ Compare with correct answer
        const question = room.questions[questionIndex];
        if (!question) return;

        const isCorrect = selectedOption === question.correctAnswerIndex;

        if (isCorrect) {
            participant.score += 1;
            console.log(`✅ ${participant.name} answered correctly. Score: ${participant.score}`);
        } else {
            console.log(`❌ ${participant.name} answered incorrectly. Score: ${participant.score}`);
        }
    });

   socket.on("answer-submitted", ({ roomId, userId, questionId }) => {
    const room = rooms[roomId];
    const participant = room?.participants?.[socket.id];

    if (!room || !participant) return;

    const name = participant.name;

    socket.to(roomId).emit("user-submitted", {
        message: `${name} has submitted their answer.`,
        userId,
        name,
        questionId,
    });
});






});


server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
