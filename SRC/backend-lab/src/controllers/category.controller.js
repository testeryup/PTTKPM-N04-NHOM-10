import Category from "../models/category.js";

export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().select('-createdAt -updatedAt -__v -description');
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const createNewCategory = async (req, res) => {
    const { categoryName, subCategories, description } = req.body;

    try {
        let result = await Category.create({
            name: categoryName,
            subcategories: subCategories,
            description: description
        });
        res.status(200).json({ result });
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const updateCategory = async (req, res) => {
    const { categoryName, subcategories } = req.body;

    try {
        const result = await Category.updateOne(
            { name: categoryName },
            { subcategories: subcategories }
        );
        if (result.modifiedCount > 0) {
            return res.status(200).json({ message: 'Update category successfully' })
        }
        return res.status(204).json({ message: 'Can not making the change' });
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const deleteCategory = async (req, res) => {
    const { categoryId } = req.body;
    if (categoryId) {
        return res.status(500).json({
            message: 'No category Id found'
        });
    }
    try {
        // Check if category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                message: 'Category not found'
            });
        }

        // Delete the category
        const result = await Category.findByIdAndDelete(categoryId);

        if (result) {
            return res.status(200).json({
                message: 'Category deleted successfully',
                deletedCategory: result
            });
        }

        return res.status(400).json({
            message: 'Failed to delete category'
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};