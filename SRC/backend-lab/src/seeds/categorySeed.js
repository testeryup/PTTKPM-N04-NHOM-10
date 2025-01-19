import Category from "../models/category.js";

const categorySeeds = [
    {
        name: "Mạng xã hội",
        description: "Tài khoản mạng xã hội",
        subcategories: [
            { name: "Twitter Blue" },
            { name: "Facebook Premium" },
            { name: "Instagram Verified" }
        ]
    },
    {
        name: "Gaming",
        description: "Tài khoản game",
        subcategories: [
            { name: "Steam" },
            { name: "Epic Games" },
            { name: "Xbox Game Pass" }
        ]
    },
    {
        name: "Phim và nhạc",
        description: "Dịch vụ phát phim, nhạc trực tuyến",
        subcategories: [
            { name: "Netflix" },
            { name: "Disney+" },
            { name: "Spotify Premium" }
        ]
    },
    {
        name: "Công việc",
        description: "Tài khoản phục vụ công việc",
        subcategories: [
            { name: "Microsoft 365" },
            { name: "Adobe Creative Cloud" },
            { name: "Canva Pro" }
        ]
    },
    {
        name: "AI",
        description: "Tài khoản AI",
        subcategories: [
            { name: "ChatGPT Plus" },
            { name: "Midjourney" },
            { name: "Claude Pro" }
        ]
    }
]

const seedCategories = async () => {
    try {
        await Category.deleteMany({});

        const result = await Category.insertMany(categorySeeds);
        console.log("check result after seed categories:", result);
        return result;
    } catch (error) {
        console.log("error seeding category:", error)
    }
};

export default seedCategories;