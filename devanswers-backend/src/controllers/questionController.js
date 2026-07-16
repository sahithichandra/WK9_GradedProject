import {
    getAllQuestionsService,
    getQuestionByIdService,
    createQuestionService,
    updateQuestionService,
    deleteQuestionService,
    downvoteQuestionService,
    upvoteQuestionService

} from "../services/questionService.js";

export const getAllQuestions = async (req, res) => {
    const questions = await getAllQuestionsService();

    res.status(200).json({
        success: true,
        message: "Questions fetched successfully",
        data: questions,
    });
};


export const getQuestionById = async (req, res) => {
    const { id } = req.params;
    const question = await getQuestionByIdService(id);

    res.status(200).json({
        success: true,
        message: "Question fetched successfully",
        data: question,
    });
};

export const createQuestion = async (req, res) => {
    const { title, description, tags } = req.body;
    const author = req.user.id;

    const newQuestion = await createQuestionService({ title, description, tags, author });

    res.status(201).json({
        success: true,
        message: "Question created successfully",
        data: newQuestion,
    });
};

export const updateQuestion = async (req, res) => {
    const { id } = req.params;
    let { title, description, tags } = req.body;

    const updatedQuestion = await updateQuestionService(id, title, description, tags, req.user);

    res.status(200).json({
        success: true,
        message: "Question updated successfully",
        data: updatedQuestion,
    });
};

export const deleteQuestion = async (req, res) => {
    const deletedQuestion = await deleteQuestionService(req.params.id, req.user);
    res.status(200).json({
        success: true,
        message: "Question deleted successfully",
        data: deletedQuestion,
    });
};

export const upvoteQuestion = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const document = await upvoteQuestionService(id, userId);

    res.status(200).json({
        success: true,
        message: "Question upvoted successfully",
        data: {
            upvotes: document.upvotes,
            downvotes: document.downvotes,
            voteCount: document.voteCount,
        }
    });
};

export const downvoteQuestion = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const document = await downvoteQuestionService(id, userId);

    res.status(200).json({
        success: true,
        message: "Question downvoted successfully",
        data: {
            upvotes: document.upvotes,
            downvotes: document.downvotes,
            voteCount: document.voteCount,
        }
    });
};
