import axios from 'axios';
import { EventHandler } from './EventHandler';
import { isValidUrl } from '../utils/validation';

export class BirthdayHandler implements EventHandler {
  async handle(user: { fullName: string; }): Promise<void> {
    const webhookUrl = process.env.WEBHOOK_URL;
    if (!webhookUrl || !isValidUrl(webhookUrl)) {
      throw new Error('Invalid or missing WEBHOOK_URL');
    }

    const message = `Hey, ${user.fullName}, it's your birthday!`;
    await axios.post(webhookUrl, { message });
    console.log(`Birthday message sent to ${user.fullName}`);
  }
}
