import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../lib/mongodb';
import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({}, { strict: false });
const studentSchema = new mongoose.Schema({}, { strict: false });
const incidentSchema = new mongoose.Schema({}, { strict: false });

const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);
const Incident = mongoose.models.Incident || mongoose.model('Incident', incidentSchema);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  try {
    const totalStudents = await Student.countDocuments();

    const today = new Date().toISOString().split('T')[0];

    const presentStudents = await Attendance.distinct('studentId', {
      status: 'present',
      date: today,
    });

    const absentStudents = await Attendance.distinct('studentId', {
      status: 'absent',
      date: today,
    });

    const totalPresent = presentStudents.length;
    const totalAbsent = absentStudents.length;
    const totalMarked = totalPresent + totalAbsent;

    const attendancePercentage = totalMarked
      ? Math.round((totalPresent / totalMarked) * 100)
      : 0;

    const topAbsent = await Attendance.aggregate([
      { $match: { status: 'absent' } },
      {
        $group: {
          _id: '$studentId',
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gte: 3 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'students',
          let: { studentIdStr: { $toString: '$_id' } },
          pipeline: [
            {
              $addFields: {
                idStr: { $toString: '$_id' }
              }
            },
            {
              $match: {
                $expr: { $eq: ['$$studentIdStr', '$idStr'] }
              }
            }
          ],
          as: 'student'
        }
      },
      
      { $unwind: '$student' },
      {
        $project: {
          name: '$student.name',
          grade: '$student.class',
          division: '$student.division',
          absent_count: '$count',
        },
      },
    ]);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const weeklyIncidents = await Incident.countDocuments({
      date: {
        $gte: weekStart.toISOString().split('T')[0],
        $lte: weekEnd.toISOString().split('T')[0],
      },
    });

    const monthlyIncidents = await Incident.countDocuments({
      date: {
        $gte: monthStart.toISOString().split('T')[0],
        $lte: monthEnd.toISOString().split('T')[0],
      },
    });

    const monthName = monthStart.toLocaleString('default', { month: 'long' });

    const highAbsenceAlerts = await Attendance.aggregate([
      { $match: { status: 'absent' } },
      {
        $group: {
          _id: '$studentId',
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gte: 5 } } },
      {
        $lookup: {
          from: 'students',
          let: { studentIdStr: { $toString: '$_id' } },
          pipeline: [
            {
              $addFields: {
                idStr: { $toString: '$_id' }
              }
            },
            {
              $match: {
                $expr: { $eq: ['$$studentIdStr', '$idStr'] }
              }
            }
          ],
          as: 'student'
        }
      },
      
      { $unwind: '$student' },
      {
        $project: {
          name: '$student.name',
          grade: '$student.class',
          division: '$student.division',
          absent_count: '$count',
        },
      },
    ]);

    res.status(200).json({
      totalStudents,
      totalPresent,
      totalAbsent,
      attendancePercentage,
      topAbsentStudents: topAbsent,
      weeklyIncidents,
      monthlyIncidents,
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      monthName,
      highAbsenceAlerts: highAbsenceAlerts,

    });
  } catch (err) {
    console.error('❌ Error in home-summary:', err);
    res.status(500).json({ error: 'Error fetching summary' });
  }
}
