import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../lib/mongodb';
import mongoose from 'mongoose';

const testTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

const TestType = mongoose.models.TestType || mongoose.model('TestType', testTypeSchema);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  try {
    const types = await TestType.find().sort({ name: 1 });
    res.status(200).json(types);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch test types' });
  }
}
