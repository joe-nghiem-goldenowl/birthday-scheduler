import cron from 'node-cron';
import { sendBirthdayMessage } from './services/birthdayService';
import { prisma } from './prismaClient';

const BATCH_SIZE = 500;

cron.schedule('0 * * * *', async () => {
  console.log('[Scheduler] Processing due birthday messages: ', new Date().toISOString());

  try {
    const dueMessages = await prisma.scheduledMessage.findMany({
      where: {
        sent: false,
        scheduledTime: {
          lte: new Date(),
        },
      },
      take: BATCH_SIZE,
      include: {
        user: true,
      },
    });

    for (const msg of dueMessages) {
      const fullName = `${msg.user.firstName} ${msg.user.lastName}`;

      try {
        await sendBirthdayMessage(fullName);

        await prisma.scheduledMessage.update({
          where: { id: msg.id },
          data: {
            sent: true,
            sentAt: new Date(),
          },
        });

        const nextYear = new Date(msg.scheduledTime);
        nextYear.setFullYear(nextYear.getFullYear() + 1);

        await prisma.scheduledMessage.create({
          data: {
            userId: msg.userId,
            scheduledTime: nextYear,
          },
        });

        console.log(`Sent birthday message to ${fullName}`);
      } catch (err) {
        console.error(`Failed to send message for user ${fullName}:`, err);
      }
    }
  } catch (err) {
    console.error('Scheduler error:', err);
  }
});

cron.schedule('0 0 * * 0', async () => {
  console.log('[Cleanup Job] Starting cleanup of old sent messages');
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  const deleted = await prisma.scheduledMessage.deleteMany({
    where: {
      sent: true,
      scheduledTime: {
        lt: cutoff,
      },
    },
  });

  console.log(`Cleanup job: deleted ${deleted.count} old sent messages`);
});
