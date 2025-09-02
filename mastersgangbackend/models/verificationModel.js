const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const verificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Hash the verification code before saving
verificationSchema.pre('save', async function (next) {
  if (this.isModified('code')) {
    this.code = await bcrypt.hash(this.code, 10);
  }
  next();
});

module.exports = mongoose.model('Verification', verificationSchema);
