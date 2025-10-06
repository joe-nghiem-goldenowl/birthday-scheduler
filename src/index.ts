import express from 'express';
import bodyParser from 'body-parser';
import userRoutes from './routes/userRoutes';
import './scheduler';
import 'dotenv/config';
import rateLimit from 'express-rate-limit';

const PORT = 3000;

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const app = express();

app.use(bodyParser.json());
app.use(limiter);
app.use('/users', userRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
