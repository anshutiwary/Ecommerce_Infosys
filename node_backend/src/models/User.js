import mongoose from 'mongoose'

const RefreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
})

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: 'USER' },
  refreshTokens: { type: [RefreshTokenSchema], default: [] },
}, { timestamps: true })

const User = mongoose.model('User', UserSchema)
export default User
