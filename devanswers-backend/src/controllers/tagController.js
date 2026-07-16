import { getAllTagsService, getQuestionsByTagService } from '../services/tagService.js';

export const getAllTags = async (req, res) => {
    const tagsWithCount = await getAllTagsService();

    res.status(200).json({
        success: true,
        message: 'Tags fetched successfully',
        data: tagsWithCount,
    });
};

export const getQuestionsByTag = async (req, res) => {
    const { tagId } = req.params;

    const questionsWithCount = await getQuestionsByTagService(tagId);

    res.status(200).json({
        success: true,
        message: 'Questions fetched successfully',
        data: questionsWithCount,
    });
};
