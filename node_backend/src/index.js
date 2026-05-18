import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import connectDb from './config/db.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import orderRoutes from './routes/orders.js'
import errorHandler from './middleware/errorHandler.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

connectDb(process.env.MONGO_URI)

app.use(express.json())
app.use(cookieParser())
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/orders', orderRoutes)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
