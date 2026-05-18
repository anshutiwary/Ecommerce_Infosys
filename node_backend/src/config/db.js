import mongoose from 'mongoose'

export default function connectDb(uri) {
  if (!uri) {
    console.warn('MONGO_URI not provided, skipping DB connection')
    return
  }

  mongoose.connect(uri, {
    autoIndex: true,
  })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => {
      console.error('MongoDB connection error:', err)
      process.exit(1)
    })
}
