import Tag from '../models/Tag.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import { createAppError } from '../utils/createAppError.js';

export const getAllTagsService = async () => {
    const tags = await Tag.find({});

    const tagsWithCount = await Promise.all(
        tags.map(async (tag) => {
            const questionCount = await Question.countDocuments({ tags: tag._id });
            return { ...tag.toObject(), questionCount };
        })
    );

    return tagsWithCount;
};

export const getQuestionsByTagService = async (tagId) => {
    const tag = await Tag.findById(tagId);
    if (!tag) {
        throw createAppError('Tag not found', 404);
    }

    const questions = await Question.find({ tags: tagId })
        .populate({ path: 'author', select: 'name' })
        .populate('tags')
        .sort({ createdAt: -1 });

    const questionsWithCount = await Promise.all(
        questions.map(async (q) => {
            const answerCount = await Answer.countDocuments({ questionId: q._id });
            return { ...(q.toObject?.() ?? q), answerCount };
        })
    );

    return questionsWithCount;
};
