import express from 'express';
import bodyParser from 'body-parser';
import userRoutes from './routes/userRoutes';
import './scheduler';
import 'dotenv/config';


const app = express();
app.use(bodyParser.json());

app.use('/user', userRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
