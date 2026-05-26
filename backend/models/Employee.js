const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    employeeId:   { type: String, unique: true },
    firstName:    { type: String, required: true, trim: true },
    lastName:     { type: String, required: true, trim: true },
    gender:       { type: String, enum: ['Male', 'Female', 'Other'] },
    dateOfBirth:  { type: Date },
    email:        { type: String, required: true, unique: true, lowercase: true },
    phone:        { type: String },
    address:      { type: String },
    position:     { type: String, required: true },
    department:   { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    salary:       { type: Number, required: true },
    joiningDate:  { type: Date, default: Date.now },
    profilePhoto: { type: String, default: '' },
    status:       { type: String, enum: ['active', 'inactive', 'terminated'], default: 'active' },
    user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

employeeSchema.pre('save', async function (next) {
  if (!this.employeeId) {
    const count = await mongoose.model('Employee').countDocuments();
    this.employeeId = `EMP${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

employeeSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Employee', employeeSchema);
