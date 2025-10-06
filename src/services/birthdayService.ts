import axios from 'axios';
import { isValidUrl } from '../utils/validation';

export async function sendBirthdayMessage(fullName: string, maxRetries = 3): Promise<boolean> {
  try {
    const webhookUrl = process.env.WEBHOOK_URL;
    if (!webhookUrl) throw new Error('WEBHOOK_URL is not defined in .env');
    if (!isValidUrl(webhookUrl)) throw new Error(`Invalid webhook URL: ${webhookUrl}`);

    const message = `Hey, ${fullName}, it's your birthday`;

    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        await axios.post(webhookUrl, { message }, { timeout: 5000 });
        console.log(`Sent birthday message to ${fullName}`);
        break;
      } catch (err: any) {
        attempt++;
        const status = err.response?.status;

        if (attempt < maxRetries && (!status || (status >= 500 && status < 600))) {
          console.warn(`Retry ${attempt}/${maxRetries} for ${webhookUrl}`);
          await new Promise(res => setTimeout(res, 1000 * attempt));
        } else {
          console.error(`Failed after ${attempt} attempts:`, err.message);
          return false;
        }
      }
    }

    return true;
  } catch (err) {
    console.error(`Failed to send birthday message to ${fullName}`, err);
    return false;
  }
}
