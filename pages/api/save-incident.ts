import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../lib/mongodb';
import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  grade: { type: String, required: true },
  division: { type: String, required: true },
  incident: { type: String, required: true },
  note: { type: String },
  date: { type: String, required: true },
});

const Incident = mongoose.models.Incident || mongoose.model('Incident', incidentSchema);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  await connectDB();

  try {
    const { studentId, grade, division, incident, note, date } = req.body;

    if (!studentId || !grade || !division || !incident || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await Incident.create({ studentId, grade, division, incident, note, date });

    res.status(201).json({ message: 'Incident saved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save incident' });
  }
}
