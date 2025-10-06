import { Router } from 'express';
import { createUser, deleteUser, updateUser } from '../services/userService';
import { isValidTimeZone } from '../utils/validation';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, birthday, location } = req.body;

    if (!first_name || !last_name || !birthday || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const birthdayDate = new Date(birthday);
    if (isNaN(birthdayDate.getTime())) {
      return res.status(400).json({ error: 'Invalid birthday format' });
    }

    if (!isValidTimeZone(location)) {
      return res.status(400).json({ error: 'Invalid timezone format' });
    }

    const newUser = await createUser({ first_name, last_name, birthday, location });
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const deleted = await deleteUser(id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updates = req.body;
    const updated = await updateUser(id, updates);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
