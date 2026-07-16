import { beforeEach, beforeAll, describe, it, expect } from "vitest";
import request from "supertest";
// Import setup to initialize MongoDB
import '../setup.js';
import app from "../../src/app.js";
import Question from "../../src/models/Question.js";
import Answer from "../../src/models/Answer.js";
import Tag from "../../src/models/Tag.js";
import dotenv from "dotenv";
dotenv.config();

let jwtToken;
let mockUser;

beforeAll(async () => {
    ({ mockUser, jwtToken } = await createUserAndLogin());
});

async function createUserAndLogin(overrides = {}) {
    const email = overrides.email || `voteuser+${Date.now()}@example.com`;
    const password = "password123";

    const userRes = await request(app)
        .post("/api/auth/register")
        .send({
            name: overrides.name || "Vote User",
            email,
            password,
            isAdmin: overrides.isAdmin || false,
        });

    const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email, password });

    return {
        mockUser: userRes.body.data,
        jwtToken: loginRes.body.data.token,
    };
}

async function createTag(name = `tag-${Date.now()}`) {
    const tag = new Tag({ name });
    await tag.save();
    return tag;
}

async function createQuestion(questionData = {}) {
    const author = questionData.author || mockUser._id;
    const tag = await createTag();

    const defaultData = {
        title: "Vote Test Question",
        description: "Testing votes",
        tags: [tag._id],
        author,
    };

    const question = new Question({ ...defaultData, ...questionData });
    await question.save();
    return question;
}

async function createAnswer(answerData = {}) {
    const author = answerData.author || mockUser._id;
    const question = answerData.question || await createQuestion();

    const defaultData = {
        questionId: question._id,
        answerText: "Vote Test Answer",
        author,
    };

    const answer = new Answer({ ...defaultData, ...answerData });
    await answer.save();
    return answer;
}

describe("Vote API", () => {
    let question;
    let answer;

    beforeEach(async () => {
        await Question.deleteMany({});
        await Answer.deleteMany({});
        await Tag.deleteMany({});

        question = await createQuestion();

        answer = await createAnswer({ question });
    });

    // -------------------
    // QUESTION VOTES
    // -------------------
    it("POST /api/questions/:id/upvote -> should upvote question", async () => {
        const res = await request(app)
            .post(`/api/questions/${question._id}/upvote`)
            .set("Authorization", `Bearer ${jwtToken}`)
            .send({ userId: mockUser._id });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Question upvoted successfully");
        expect(res.body.data.voteCount).toBe(1);
        expect(res.body.data.upvotes).toHaveLength(1);
        expect(res.body.data.downvotes).toHaveLength(0);
    });

    it("POST /api/questions/:id/downvote -> should downvote question", async () => {
        const res = await request(app)
            .post(`/api/questions/${question._id}/downvote`)
            .set("Authorization", `Bearer ${jwtToken}`)
            .send({ userId: mockUser._id });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Question downvoted successfully");
        expect(res.body.data.voteCount).toBe(-1);
        expect(res.body.data.upvotes).toHaveLength(0);
        expect(res.body.data.downvotes).toHaveLength(1);
    });

    // -------------------
    // ANSWER VOTES
    // -------------------
    it("POST /api/answers/:id/upvote -> should upvote answer", async () => {
        const res = await request(app)
            .post(`/api/answers/${answer._id}/upvote`)
            .set("Authorization", `Bearer ${jwtToken}`)
            .send({ userId: mockUser._id });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Answer upvoted successfully");
        expect(res.body.data.upvotes.map(id => id.toString())).toContain(mockUser._id.toString());
    });

    it("POST /api/answers/:id/downvote -> should downvote answer", async () => {
        const res = await request(app)
            .post(`/api/answers/${answer._id}/downvote`)
            .set("Authorization", `Bearer ${jwtToken}`)
            .send({ userId: mockUser._id });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Answer downvoted successfully");
        expect(res.body.data.downvotes.map(id => id.toString())).toContain(mockUser._id.toString());
    });

    // -------------------
    // ERROR CASES
    // -------------------
    it("POST /api/questions/:id/upvote -> should return error if question not found", async () => {
        const fakeId = "507f1f77bcf86cd799439011";
        const res = await request(app)
            .post(`/api/questions/${fakeId}/upvote`)
            .set("Authorization", `Bearer ${jwtToken}`)
            .send({ userId: mockUser._id });

        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);
    });

    it("POST /api/answers/:id/upvote -> should return error if answer not found", async () => {
        const fakeId = "507f1f77bcf86cd799439011";
        const res = await request(app)
            .post(`/api/answers/${fakeId}/upvote`)
            .set("Authorization", `Bearer ${jwtToken}`)
            .send({ userId: mockUser._id });

        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);
    });
});
