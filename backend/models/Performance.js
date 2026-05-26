const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema(
  {
    employee:    { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    period:      { type: String, required: true },
    rating:      { type: Number, min: 1, max: 5, required: true },
    categories: {
      productivity:  { type: Number, min: 1, max: 5 },
      teamwork:      { type: Number, min: 1, max: 5 },
      communication: { type: Number, min: 1, max: 5 },
      punctuality:   { type: Number, min: 1, max: 5 },
      quality:       { type: Number, min: 1, max: 5 },
    },
    comments: { type: String },
    goals:    { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Performance', performanceSchema);
