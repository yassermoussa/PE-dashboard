import mongoose, { Schema, models, model } from 'mongoose';

const studentSchema = new Schema({
  name: { type: String, required: true },
  class: { type: String, required: true },
  division: { type: String, required: true },
});

const Student = models.Student || model('Student', studentSchema);

export default Student;
