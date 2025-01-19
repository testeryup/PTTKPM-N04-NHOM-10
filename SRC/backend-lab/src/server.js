import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import connectDB from './config/db.config.js';

import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js'; // Uncomment this line
import adminRoutes from './routes/admin.routes.js';
import userRoutes from './routes/user.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import transactionRoutes from './routes/transaction.routes.js'; // Import transaction routes
import categoryRoutes from './routes/category.routes.js'


// import seedCategories from './seeds/categorySeed.js';

dotenv.config();
const app = express();

app.use(express.json({limit: '50mb'})); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '50mb', parameterLimit: 50000 })); // Parse URL-encoded bodies
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000', // Frontend URL
    credentials: true, // Allow credentials (cookies, authorization headers)
}));

// seedCategories()
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes); // Use order routes
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/transactions', transactionRoutes); // Use transaction routes



connectDB();

const port = process.env.PORT || 9696;
app.listen(port, () => {
    console.log("running server at port:", port);
});