package com.infosys.backend.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.backend.dto.CheckoutResponse;
import com.infosys.backend.dto.CheckoutResponse.CheckoutItemResponse;
import com.infosys.backend.exception.BadRequestException;
import com.infosys.backend.exception.PaymentProcessingException;
import com.infosys.backend.exception.ResourceNotFoundException;
import com.infosys.backend.exception.UnauthorizedException;
import com.infosys.backend.model.Cart;
import com.infosys.backend.model.Order;
import com.infosys.backend.model.OrderItem;
import com.infosys.backend.model.OrderStatus;
import com.infosys.backend.model.PaymentMethod;
import com.infosys.backend.model.Product;
import com.infosys.backend.model.User;
import com.infosys.backend.repository.CartRepository;
import com.infosys.backend.repository.OrderRepository;
import com.infosys.backend.repository.ProductRepository;

@Service
public class CheckoutService {

    private static final Logger logger = LoggerFactory.getLogger(CheckoutService.class);

    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public CheckoutService(CartRepository cartRepository, OrderRepository orderRepository, ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
    public CheckoutResponse checkout(User user, String shippingAddress, PaymentMethod paymentMethod) {
        logger.info("Starting checkout for user {} with payment method {}", user.getEmail(), paymentMethod);
        validateCheckoutRequest(user, shippingAddress, paymentMethod);

        List<Cart> cartItems = cartRepository.findByUser(user);
        validateCart(cartItems);

        Order order = buildOrder(user, shippingAddress, paymentMethod);
        List<Product> productsToUpdate = new ArrayList<>();

        for (Cart cartItem : cartItems) {
            Product product = productRepository.findById(cartItem.getProduct().getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + cartItem.getProduct().getProductId()));
            int requestedQuantity = cartItem.getQuantity();

            validateProduct(product, requestedQuantity);

            OrderItem orderItem = buildOrderItem(product, requestedQuantity);
            order.addOrderItem(orderItem);

            int newStock = product.getQuantity() - requestedQuantity;
            if (newStock < 0) {
                throw new BadRequestException("Stock error for product: " + product.getName());
            }
            product.setQuantity(newStock);
            productsToUpdate.add(product);
        }

        order.setTotalAmount(calculateTotalPrice(cartItems));
        order.setOrderedAt(Instant.now());
        Order savedOrder = orderRepository.save(order);

        processPayment(savedOrder);
        productRepository.saveAll(productsToUpdate);
        cartRepository.deleteByUser(user);

        logger.info("Checkout completed successfully for order {} and user {}", savedOrder.getOrderNumber(), user.getEmail());
        return toCheckoutResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<CheckoutResponse> getOrdersByUser(User user) {
        return orderRepository.findByUserOrderByOrderedAtDesc(user).stream()
                .map(this::toCheckoutResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CheckoutResponse getOrderById(User user, int orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        boolean isOwner = order.getUser().getUserId() == user.getUserId();
        boolean isAdmin = "ADMIN".equalsIgnoreCase(user.getRole());

        if (!isOwner && !isAdmin) {
            throw new UnauthorizedException("Access denied to order");
        }

        return toCheckoutResponse(order);
    }

    @Transactional(readOnly = true)
    public List<CheckoutResponse> getAllOrders() {
        return orderRepository.findAllByOrderByOrderedAtDesc().stream()
                .map(this::toCheckoutResponse)
                .toList();
    }

    @Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
    public CheckoutResponse approveOrder(int orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Only pending orders can be approved");
        }

        order.setStatus(OrderStatus.APPROVED);
        Order approvedOrder = orderRepository.save(order);
        logger.info("Order {} approved", approvedOrder.getOrderNumber());
        return toCheckoutResponse(approvedOrder);
    }

    private void validateCheckoutRequest(User user, String shippingAddress, PaymentMethod paymentMethod) {
        if (user == null) {
            throw new BadRequestException("User is required");
        }

        if (shippingAddress == null || shippingAddress.isBlank()) {
            throw new BadRequestException("Shipping address is required");
        }

        if (paymentMethod == null) {
            throw new BadRequestException("Payment method is required");
        }
    }

    private void validateCart(List<Cart> cartItems) {
        if (cartItems == null || cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }
    }

    private Order buildOrder(User user, String shippingAddress, PaymentMethod paymentMethod) {
        return Order.builder()
                .user(user)
                .status(OrderStatus.PENDING)
                .paymentMethod(paymentMethod)
                .shippingAddress(shippingAddress.trim())
                .build();
    }

    private OrderItem buildOrderItem(Product product, int requestedQuantity) {
        OrderItem orderItem = OrderItem.builder()
                .product(product)
                .quantity(requestedQuantity)
                .unitPrice(product.getPrice())
                .build();
        orderItem.calculateSubtotal();
        return orderItem;
    }

    private void validateProduct(Product product, int requestedQuantity) {
        if (product == null) {
            throw new ResourceNotFoundException("Product not found");
        }

        if (requestedQuantity <= 0) {
            throw new BadRequestException("Cart item quantity must be greater than zero");
        }

        if (Boolean.FALSE.equals(product.getIsActive())) {
            throw new BadRequestException("Product is not available: " + product.getName());
        }

        if (product.getPrice() == null) {
            throw new BadRequestException("Product price is missing: " + product.getName());
        }

        if (product.getQuantity() < requestedQuantity) {
            throw new BadRequestException("Insufficient stock for product: " + product.getName());
        }
    }

    private void processPayment(Order order) {
        logger.info("Processing payment for order {}", order.getOrderNumber());

        if (order.getTotalAmount() == null || order.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new PaymentProcessingException("Order amount must be greater than zero");
        }

        try {
            // Placeholder for actual payment integration.
            // Replace this stub with the real payment gateway call.
            if (order.getPaymentMethod() == PaymentMethod.CREDIT_CARD && order.getTotalAmount().compareTo(new BigDecimal("100000")) > 0) {
                throw new PaymentProcessingException("Credit card transaction was declined");
            }
            logger.info("Payment processing succeeded for order {}", order.getOrderNumber());
        } catch (RuntimeException ex) {
            logger.error("Payment processing failed for order {}", order.getOrderNumber(), ex);
            throw ex;
        } catch (Exception ex) {
            logger.error("Payment processing failed for order {}", order.getOrderNumber(), ex);
            throw new PaymentProcessingException("Payment processing failed", ex);
        }
    }

    public BigDecimal calculateTotalPrice(List<Cart> cartItems) {
        if (cartItems == null || cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        return cartItems.stream()
                .map(this::calculateCartItemTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateCartItemTotal(Cart cartItem) {
        if (cartItem == null || cartItem.getProduct() == null) {
            throw new BadRequestException("Invalid cart item");
        }

        Product product = cartItem.getProduct();
        int quantity = cartItem.getQuantity();

        if (quantity <= 0) {
            throw new BadRequestException("Cart item quantity must be greater than zero");
        }

        if (product.getPrice() == null) {
            throw new BadRequestException("Product price is missing: " + product.getName());
        }

        return product.getPrice().multiply(BigDecimal.valueOf(quantity));
    }

    private CheckoutResponse toCheckoutResponse(Order order) {
        List<CheckoutItemResponse> itemResponses = order.getOrderItems().stream()
                .map(item -> new CheckoutItemResponse(
                        item.getOrderItemId(),
                        item.getProduct().getProductId(),
                        item.getProduct().getName(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getSubtotal()))
                .toList();

        return new CheckoutResponse(
                "Checkout completed successfully",
                order.getOrderId(),
                order.getOrderNumber(),
                order.getUser().getUserId(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getPaymentMethod(),
                order.getShippingAddress(),
                order.getOrderedAt(),
                itemResponses);
    }
}
