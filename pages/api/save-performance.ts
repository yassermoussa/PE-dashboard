import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../lib/mongodb';
import mongoose from 'mongoose';

const performanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  grade: { type: String, required: true },
  division: { type: String, required: true },
  test_type: { type: String, required: true },
  result: { type: String, required: true },
  date: { type: String, required: true },
});

const Performance = mongoose.models.Performance || mongoose.model('Performance', performanceSchema);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  await connectDB();

  try {
    const { studentId, grade, division, test_type, result, date } = req.body;

    if (!studentId || !grade || !division || !test_type || !result || !date) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    await Performance.create({ studentId, grade, division, test_type, result, date });

    res.status(201).json({ message: 'Performance saved' });
  } catch (err) {
    res.status(500).json({ error: 'Error saving performance' });
  }
}
