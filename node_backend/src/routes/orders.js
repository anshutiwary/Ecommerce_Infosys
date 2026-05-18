import express from 'express'
import auth from '../middleware/authMiddleware.js'
import * as orderController from '../controllers/orderController.js'

const router = express.Router()

router.get('/', auth, orderController.getMyOrders)
router.get('/:id', auth, orderController.getOrderById)

export default router
