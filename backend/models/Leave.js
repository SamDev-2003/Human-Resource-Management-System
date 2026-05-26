const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    employee:     { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    leaveType:    { type: String, enum: ['annual','sick','maternity','emergency','other'], required: true },
    startDate:    { type: Date, required: true },
    endDate:      { type: Date, required: true },
    totalDays:    { type: Number },
    reason:       { type: String, required: true },
    status:       { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
    approvedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvalNote: { type: String },
    approvedAt:   { type: Date },
  },
  { timestamps: true }
);

leaveSchema.pre('save', function (next) {
  if (this.startDate && this.endDate) {
    this.totalDays = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24)) + 1;
  }
  next();
});

module.exports = mongoose.model('Leave', leaveSchema);
