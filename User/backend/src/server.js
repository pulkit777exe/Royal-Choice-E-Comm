import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { userRouter } from './routes/User.routes.js';
import { productRouter } from './routes/Product.routes.js';
import { paymentRouter } from './routes/Payment.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// For Stripe webhook - must be before other middleware
app.post('/api/v1/payment/webhook', express.raw({ type: 'application/json' }));

// CORS middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.VITE_APP_URL 
    : ["http://localhost:5173", "https://royal-choice.netlify.app"],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Regular middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Routes
app.use('/api/v1/user', userRouter);
app.use('/api/v1/product', productRouter);
app.use('/api/v1/payment', paymentRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_CONNECTION_URL)
  .then(() => {
    console.log('Connected to MongoDB');
    
    const migrateCartItems = async () => {
      try {
        const { UserModel } = await import('./models/User.models.js');
        const users = await UserModel.find({});
        
        for (const user of users) {
          if (Array.isArray(user.userCart) && user.userCart.length > 0) {
            if (typeof user.userCart[0] !== 'object' || !user.userCart[0].productId) {
              console.log(`Migrating cart for user ${user._id}`);
              
              const newCart = user.userCart.map(productId => ({
                productId,
                quantity: 1
              }));
              
              user.userCart = newCart;
              await user.save();
              
              console.log(`Migrated ${newCart.length} cart items for user ${user._id}`);
            }
          }
        }
        
        console.log('Cart migration completed');
      } catch (error) {
        console.error('Error migrating cart items:', error);
      }
    };
    
    migrateCartItems();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} - http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    // Don't crash the server if MongoDB connection fails
    console.log('Starting server without MongoDB connection...');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (without DB) - http://localhost:${PORT}`);
    });
  });

export default app;
