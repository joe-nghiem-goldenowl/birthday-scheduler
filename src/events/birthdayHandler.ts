import axios from 'axios';
import { EventHandler } from './EventHandler';
import { isValidUrl } from '../utils/validation';
import { prisma } from '../prismaClient';
import { calculateNextBirthdayAt9AM } from '../utils/dateUtils';

export class BirthdayHandler implements EventHandler {
  async handle(user: { userId: number, fullName: string, birthday: string, location: string }): Promise<void> {
    const webhookUrl = process.env.WEBHOOK_URL;
    if (!webhookUrl || !isValidUrl(webhookUrl)) {
      throw new Error('Invalid or missing WEBHOOK_URL');
    }

    const message = `Hey, ${user.fullName}, it's your birthday!`;
    await axios.post(webhookUrl, { message });
    console.log(`Birthday message sent to ${user.fullName}`);

    await prisma.scheduledMessage.updateMany({
      where: {
        userId: user.userId,
        scheduledTime: { lte: new Date() },
        status: 'PENDING',
      },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    const nextBirthday = calculateNextBirthdayAt9AM(user.birthday, user.location);
    await prisma.scheduledMessage.create({
      data: {
        userId: user.userId,
        scheduledTime: nextBirthday,
      }
    });

    console.log(`Scheduled next birthday message for ${user.fullName} at ${nextBirthday.toISOString()}`);

  }
}
