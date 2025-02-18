import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import PayOS from '@payos/node';
import connectDB from './config/db.config.js';

import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js'; // Uncomment this line
import adminRoutes from './routes/admin.routes.js';
import userRoutes from './routes/user.routes.js';
import sellerRoutes from './routes/seller.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import transactionRoutes from './routes/transaction.routes.js'; // Import transaction routes
import categoryRoutes from './routes/category.routes.js'
import skuRoutes from './routes/sku.routes.js';

// import seedCategories from './seeds/categorySeed.js';

dotenv.config();
const payOS = new PayOS(
    process.env.PAYOS_CLIENT_ID,
    process.env.PAYOS_API_KEY,
    process.env.PAYOS_CHECKSUM_KEY
  );
const app = express();

app.use(express.json({limit: '50mb'})); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '50mb', parameterLimit: 50000 })); // Parse URL-encoded bodies
app.use(cookieParser());
app.use(cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, etc)

      if (!origin) return callback(null, true);
      // Check if the origin is localhost or matches ngrok pattern
      if (
        origin === 'http://localhost:3000' || 
        /^https:\/\/.*\.ngrok-free\.app$/.test(origin) || origin === 'https://my.payos.vn'
      ) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  }));

// seedCategories()
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes); // Use order routes
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/user', userRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/transactions', transactionRoutes); // Use transaction routes
app.use('/api/sku', skuRoutes); // Use transaction routes


app.post("/create-embedded-payment-link", async (req, res) => {

    const YOUR_DOMAIN = `http://localhost:3000`;
    const body = {
      orderCode: Number(String(Date.now()).slice(-6)),
      amount: 10000,
      description: "Thanh toan don hang",
      returnUrl: `${YOUR_DOMAIN}`,
      cancelUrl: `${YOUR_DOMAIN}`,
    };
  
    try {
      const paymentLinkResponse = await payOS.createPaymentLink(body);
      console.log(paymentLinkResponse)
      res.send(paymentLinkResponse)
    } catch (error) {
      console.error(error);
      res.send("Something went error");
    }
  })
  
connectDB();

const port = process.env.PORT || 9696;
app.listen(port, () => {
    console.log("running server at port:", port);
});