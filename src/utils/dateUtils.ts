import { toZonedTime } from 'date-fns-tz';

export function calculateNextBirthdayAt9AM(birthday: string, timezone: string): Date {
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
