import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../lib/mongodb';
import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  grade: { type: String, required: true },
  division: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, required: true },
  notes: { type: [String], default: [] },
});

const Attendance =
  mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  await connectDB();

  try {
    const records = req.body;

    console.log('✅ Records received:', records);

    if (!Array.isArray(records)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    const invalid = records.find(
      (r) => !r.studentId || !r.grade || !r.division || !r.status || !r.date
    );

    if (invalid) {
      console.log('❌ Invalid Record:', invalid);
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await Attendance.insertMany(records);

    res.status(201).json({ message: 'Attendance saved' });
  } catch (err) {
    console.error('❌ Error saving attendance:', err);
    res.status(500).json({ error: 'Server error' });
  }
}
