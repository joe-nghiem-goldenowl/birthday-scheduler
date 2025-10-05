import cron from 'node-cron';
import { sendBirthdayMessage } from './services/birthdayService';
import { prisma } from './prismaClient';

const sentToday = new Set<string>();

cron.schedule('0 * * * *', async () => {
  console.log('⏰ Scheduler tick:', new Date().toISOString());

  try {
    const dueMessages = await prisma.scheduledMessage.findMany({
      where: {
        sent: false,
        scheduledTime: {
          lte: new Date(),
        },
      },
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
