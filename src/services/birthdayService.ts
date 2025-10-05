import axios from 'axios';

export async function sendBirthdayMessage(fullName: string) {
  try {
    const webhookUrl = process.env.WEBHOOK_URL;
    if (!webhookUrl) throw new Error('WEBHOOK_URL is not defined in .env');

    const message = `Hey, ${fullName}, it's your birthday`;

    const res = await axios.post(webhookUrl, { message });
    console.log(`🎉 Sent birthday message to ${fullName}`);
    return res.data;
  } catch (err) {
    console.error(`❌ Failed to send birthday message to ${fullName}`, err);
  }
}
