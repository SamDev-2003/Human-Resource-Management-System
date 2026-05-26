const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema(
  {
    employee:        { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    month:           { type: Number, required: true },
    year:            { type: Number, required: true },
    basicSalary:     { type: Number, required: true },
    allowances:      { type: Number, default: 0 },
    overtime:        { type: Number, default: 0 },
    bonus:           { type: Number, default: 0 },
    taxDeduction:    { type: Number, default: 0 },
    otherDeductions: { type: Number, default: 0 },
    netSalary:       { type: Number },
    status:          { type: String, enum: ['pending','paid'], default: 'pending' },
    paidAt:          { type: Date },
    generatedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

payrollSchema.pre('save', function (next) {
  this.netSalary =
    this.basicSalary + this.allowances + this.overtime + this.bonus
    - this.taxDeduction - this.otherDeductions;
  next();
});

payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
