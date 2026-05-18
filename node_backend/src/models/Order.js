import mongoose from 'mongoose'

const OrderItemSchema = new mongoose.Schema({
  productId: { type: Number, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: mongoose.Types.Decimal128, required: true },
  subtotal: { type: mongoose.Types.Decimal128, required: true }
})

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [OrderItemSchema], default: [] },
  totalAmount: { type: mongoose.Types.Decimal128, required: true },
  shippingAddress: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  orderStatus: { type: String, default: 'CONFIRMED' },
  paymentStatus: { type: String, default: 'PENDING' },
  paymentReference: { type: String },
  maskedPaymentIdentifier: { type: String },
  orderedAt: { type: Date, default: Date.now }
}, { timestamps: true })

const Order = mongoose.model('Order', OrderSchema)
export default Order
