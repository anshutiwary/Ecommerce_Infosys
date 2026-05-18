import Order from '../models/Order.js'
import mongoose from 'mongoose'

export async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: mongoose.Types.ObjectId(req.user.userId) }).sort({ orderedAt: -1 })
    res.json({ orders })
  } catch (err) {
    next(err)
  }
}

export async function getOrderById(req, res, next) {
  try {
    const id = req.params.id
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid order id' })

    const order = await Order.findById(id)
    if (!order) return res.status(404).json({ message: 'Order not found' })

    if (order.user.toString() !== req.user.userId) return res.status(403).json({ message: 'Access denied' })

    res.json({ order })
  } catch (err) {
    next(err)
  }
}
