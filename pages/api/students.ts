import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../lib/mongodb';
import Student from '../../models/student';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { grade, division } = req.query;

  if (!grade || !division) {
    return res.status(400).json({ error: 'Missing grade or division' });
  }

  try {
    const students = await Student.find({
      class: grade,
      division: division,
    }).sort({ name: 1 });

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
}
