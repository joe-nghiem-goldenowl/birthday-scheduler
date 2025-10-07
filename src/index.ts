import 'dotenv/config';
import './scheduler';
import express from 'express';
import bodyParser from 'body-parser';
import userRoutes from './routes/userRoutes';
import rateLimit from 'express-rate-limit';
import { ExpressAdapter } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { createBullBoard } from '@bull-board/api';
import { eventQueue } from './queues/eventQueue';
import { recoverScheduledJobs, scheduleCleanupJob, scheduleHourlySchedulerJob } from './scheduler';
import { registerFailedHandler } from './jobs/failedHandlerWorkerJob';

const PORT = Number(process.env.PORT ?? 3000);

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX ?? 500),
  standardHeaders: true,
  legacyHeaders: false,
});

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullAdapter(eventQueue)],
  serverAdapter,
});

const app = express();

app.use(bodyParser.json());
app.use(limiter);
app.use('/users', userRoutes);
app.use('/admin/queues', serverAdapter.getRouter());

scheduleHourlySchedulerJob();
scheduleCleanupJob();
registerFailedHandler();

app.listen(PORT, async () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  await recoverScheduledJobs();
});
