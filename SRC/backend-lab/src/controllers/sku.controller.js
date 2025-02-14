import mongoose from 'mongoose';
import SKU from '../models/sku.js';

export const getSkuNames = async (req, res) => {
    try {
        const skuIds = req.body?.items;
        if (!skuIds || !skuIds.length) {
            throw new Error("Missing input parameter");
        }

        const skus = await SKU.aggregate(
            [
                {
                    $match: {
                        _id: {
                            $in: skuIds.map(id => new mongoose.Types.ObjectId(id))
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'product',
                        foreignField: '_id',
                        as: 'productDetails'
                    }
                },
                {
                    $project: {
                        name: 1,
                        price: 1,
                        // stock: 1,
                        productName: { $arrayElemAt: ['$productDetails.name', 0] }
                    }
                }
            ]
        )
        return res.status(200).json({
            errCode: 0,
            data: skus
        });
    } catch (error) {
        return res.status(500).json({
            errCode: 1,
            message: error.message
        })
    }
}