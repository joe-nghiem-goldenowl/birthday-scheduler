import { scheduleBirthdayJob, rescheduleBirthdayMessage } from './scheduleService';
import { User, UserUpdate } from '../types/user';
import { format } from 'date-fns';
import { prisma } from '../prismaClient';
import { Prisma } from '@prisma/client';
import { eventQueue } from '../queues/eventQueue';

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

  await scheduleBirthdayJob(createdUser);

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

  const jobId = `birthday-${existing.id}`;
  const oldJob = await eventQueue.getJob(jobId);
  if (oldJob) {
    await oldJob.remove();
    console.log(`Removed old birthday job for user ${existing.id}`);
  }

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

  const dataToUpdate: Prisma.UserUpdateInput = {
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

    const jobId = `birthday-${updatedUser.id}`;
    const oldJob = await eventQueue.getJob(jobId);
    if (oldJob) {
      await oldJob.remove();
      console.log(`Removed old birthday job for user ${updatedUser.id}`);
    }

    await scheduleBirthdayJob(updatedUser);
  }
  const birthdayStr = format(updatedUser.birthday, 'yyyy-MM-dd');

  return {
    first_name: updatedUser.firstName,
    last_name: updatedUser.lastName,
    birthday: birthdayStr,
    location: updatedUser.location,
  };
}
