import { scheduleBirthdayMessage, rescheduleBirthdayMessage } from './scheduleService';
import { User, UserUpdate } from '../types/user';
import { format } from 'date-fns';
import { prisma } from '../prismaClient';

export async function createUser(user: User): Promise<User> {
  const createdUser = await prisma.user.create({
    data: {
      firstName: user.first_name,
      lastName: user.last_name,
      birthday: new Date(user.birthday),
      location: user.location,
    },
  });

  const birthdayStr = format(createdUser.birthday, 'yyyy-MM-dd');

  await scheduleBirthdayMessage(createdUser.id, birthdayStr, createdUser.location);

  return {
    first_name: createdUser.firstName,
    last_name: createdUser.lastName,
    birthday: birthdayStr,
    location: createdUser.location,
  };
}

export async function deleteUser(id: number): Promise<boolean> {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return false;

  await prisma.user.delete({
    where: { id },
  });

  return true;
}

export async function updateUser(id: number, updates: UserUpdate): Promise<UserUpdate | null> {
  const currentUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!currentUser) return null;

  const dataToUpdate: any = {
    firstName: updates.first_name ?? currentUser.firstName,
    lastName: updates.last_name ?? currentUser.lastName,
    location: updates.location ?? currentUser.location,
    birthday: updates.birthday
      ? new Date(updates.birthday)
      : currentUser.birthday,
  };

  const updatedUser = await prisma.user.update({
    where: { id },
    data: dataToUpdate,
  });

  const birthdayChanged = updates.birthday && updates.birthday !== currentUser.birthday.toISOString().split('T')[0];
  const locationChanged = updates.location && updates.location !== currentUser.location;

  if (birthdayChanged || locationChanged) {
    await rescheduleBirthdayMessage(updatedUser);
  }
  const birthdayStr = format(updatedUser.birthday, 'yyyy-MM-dd');

  return {
    first_name: updatedUser.firstName,
    last_name: updatedUser.lastName,
    birthday: birthdayStr,
    location: updatedUser.location,
  };
}
