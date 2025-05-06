import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../lib/mongodb';
import mongoose from 'mongoose';

const testTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

const TestType = mongoose.models.TestType || mongoose.model('TestType', testTypeSchema);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  await connectDB();

  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Test name is required' });

  try {
    const existing = await TestType.findOne({ name });
    if (existing) return res.status(409).json({ error: 'Test already exists' });

    await TestType.create({ name });
    res.status(201).json({ message: 'Test added' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add test' });
  }
}
