import type { NextApiRequest, NextApiResponse } from 'next'
import connectDB from '../../lib/mongodb'
import mongoose from 'mongoose'


const attendanceSchema = new mongoose.Schema({}, { strict: false })
const performanceSchema = new mongoose.Schema({}, { strict: false })
const incidentSchema = new mongoose.Schema({}, { strict: false })

const Attendance =
  mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema)
const Performance =
  mongoose.models.Performance || mongoose.model('Performance', performanceSchema)
const Incident =
  mongoose.models.Incident || mongoose.model('Incident', incidentSchema)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB()

  const { studentId } = req.query
  if (!studentId) return res.status(400).json({ error: 'Missing studentId' })

  try {
    const filter = { student_id: studentId } // تأكد إن اسم الحقل في القاعدة فعلاً student_id

    const attendanceRecords = await Attendance.find(filter)
    const performanceRecords = await Performance.find(filter)
    const incidentRecords = await Incident.find(filter)

    console.log('attendanceRecords:', attendanceRecords)
    console.log('performanceRecords:', performanceRecords)
    console.log('incidentRecords:', incidentRecords)

    const summary = {
      presentCount: attendanceRecords.filter((r) => r.status === 'present').length,
      absentCount: attendanceRecords.filter((r) => r.status === 'absent').length,
      lateCount: attendanceRecords.filter((r) => r.status === 'late').length,
      excusedCount: attendanceRecords.filter((r) => r.status === 'excused').length,
      notesCount: attendanceRecords.reduce((acc, r) => acc + (r.notes?.length || 0), 0),
      attendance: attendanceRecords,
      performance: performanceRecords,
      incident: incidentRecords,
    }

    res.status(200).json(summary)
  } catch (err) {
    console.error('Error loading profile:', err)
    res.status(500).json({ error: 'Server error' })
  }
}
