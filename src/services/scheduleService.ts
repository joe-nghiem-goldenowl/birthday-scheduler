import { toZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';
import { prisma } from '../prismaClient';

export async function scheduleBirthdayMessage(
  userId: number,
  birthday: string,      // "YYYY-MM-DD"
  location: string       // timezone string (e.g. "America/New_York")
): Promise<void> {
  const nextBirthday = calculateNextBirthdayAt9AM(birthday, location);

  await prisma.scheduledMessage.create({
    data: {
      userId,
      scheduledTime: nextBirthday,
    },
  });
}

function calculateNextBirthdayAt9AM(birthday: string, timezone: string): Date {
  const now = new Date();
  const [year, month, day] = birthday.split('-').map(Number);
  const currentYear = now.getUTCFullYear();

  const birthdayThisYearLocal = new Date(
    currentYear,
    month! - 1,
    day,
    9, 0, 0
  );

  let birthdayThisYearUTC = toZonedTime(birthdayThisYearLocal, timezone);

  if (birthdayThisYearUTC < now) {
    const birthdayNextYearLocal = new Date(
      currentYear + 1,
      month! - 1,
      day,
      9, 0, 0
    );
    birthdayThisYearUTC = toZonedTime(birthdayNextYearLocal, timezone);
  }

  return birthdayThisYearUTC;
}

export async function rescheduleBirthdayMessage(user: any) {
  // Xoá message cũ chưa gửi
  await prisma.scheduledMessage.deleteMany({
    where: {
      userId: user.id,
      sent: false,
    },
  });

  // Tính ngày sinh năm nay
  const birthdayStr = format(user.birthday, 'yyyy-MM-dd');
  const [year, month, day] = birthdayStr.split('-').map(Number);
  const currentYear = new Date().getFullYear();

  // Tạo Date 9:00 sáng ở timezone location của user
  const birthdayThisYearLocal = new Date(currentYear, month! - 1, day, 9, 0, 0);

  // Chuyển sang UTC để lưu vào DB
  const birthdayUTC = toZonedTime(birthdayThisYearLocal, user.location);

  await prisma.scheduledMessage.create({
    data: {
      userId: user.id,
      scheduledTime: birthdayUTC
    },
  });

}
