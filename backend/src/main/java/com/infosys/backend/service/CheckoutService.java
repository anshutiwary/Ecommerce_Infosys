package com.infosys.backend.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.backend.dto.CheckoutResponse;
import com.infosys.backend.dto.CheckoutResponse.CheckoutItemResponse;
import com.infosys.backend.dto.PaymentDetailsRequest;
import com.infosys.backend.dto.ShippingAddressRequest;
import com.infosys.backend.exception.BadRequestException;
import com.infosys.backend.exception.PaymentProcessingException;
import com.infosys.backend.exception.ResourceNotFoundException;
import com.infosys.backend.exception.UnauthorizedException;
import com.infosys.backend.model.Cart;
import com.infosys.backend.model.Order;
import com.infosys.backend.model.OrderItem;
import com.infosys.backend.model.OrderStatus;
import com.infosys.backend.model.PaymentMethod;
import com.infosys.backend.model.PaymentStatus;
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
    public CheckoutResponse checkout(User user, ShippingAddressRequest shippingAddress, PaymentDetailsRequest paymentDetails) {
        validateCheckoutRequest(user, shippingAddress, paymentDetails);
        logger.info("Starting checkout for user {} with payment method {}", user.getEmail(), paymentDetails.getPaymentMethod());

        List<Cart> cartItems = cartRepository.findByUser(user);
        validateCart(cartItems);

        Order order = buildOrder(user, shippingAddress, paymentDetails);
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

        processPayment(savedOrder, paymentDetails);
        productRepository.saveAll(productsToUpdate);
        cartRepository.deleteByUser(user);

        logger.info("Checkout completed successfully for order {} and user {}", savedOrder.getOrderNumber(), user.getEmail());
        return toCheckoutResponse(savedOrder);
    }

    @Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
    public CheckoutResponse saveShippingAddress(User user, int orderId, ShippingAddressRequest shippingAddress) {
        validateUser(user);
        validateShippingAddress(shippingAddress);

        Order order = getOwnedOrder(user, orderId);
        if (isFinalOrder(order)) {
            throw new BadRequestException("Shipping address cannot be changed for this order");
        }

        order.setShippingAddress(formatShippingAddress(shippingAddress));
        Order savedOrder = orderRepository.save(order);
        return toCheckoutResponse(savedOrder, "Shipping address saved successfully");
    }

    @Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
    public CheckoutResponse savePaymentDetails(User user, int orderId, PaymentDetailsRequest paymentDetails) {
        validateUser(user);
        validatePaymentDetails(paymentDetails);

        Order order = getOwnedOrder(user, orderId);
        if (isFinalOrder(order)) {
            throw new BadRequestException("Payment details cannot be changed for this order");
        }
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BadRequestException("Payment details cannot be changed after payment is completed");
        }

        applyPaymentDetails(order, paymentDetails);
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setPaymentReference(null);
        order.setPaymentFailureReason(null);

        Order savedOrder = orderRepository.save(order);
        return toCheckoutResponse(savedOrder, "Payment details saved successfully");
    }

    @Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class, noRollbackFor = PaymentProcessingException.class)
    public CheckoutResponse processPayment(User user, int orderId, PaymentDetailsRequest paymentDetails) {
        validateUser(user);
        validatePaymentDetails(paymentDetails);

        Order order = getOwnedOrder(user, orderId);
        if (isFinalOrder(order)) {
            throw new BadRequestException("Payment cannot be processed for this order");
        }
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BadRequestException("Payment has already been completed");
        }

        applyPaymentDetails(order, paymentDetails);
        processPayment(order, paymentDetails);
        Order paidOrder = orderRepository.save(order);
        return toCheckoutResponse(paidOrder, "Payment processed successfully");
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

    private void validateCheckoutRequest(User user, ShippingAddressRequest shippingAddress, PaymentDetailsRequest paymentDetails) {
        validateUser(user);
        validateShippingAddress(shippingAddress);
        validatePaymentDetails(paymentDetails);
    }

    private void validateUser(User user) {
        if (user == null) {
            throw new BadRequestException("User is required");
        }
    }

    private void validateShippingAddress(ShippingAddressRequest shippingAddress) {
        if (shippingAddress == null) {
            throw new BadRequestException("Shipping address is required");
        }
    }

    private void validatePaymentDetails(PaymentDetailsRequest paymentDetails) {
        if (paymentDetails == null || paymentDetails.getPaymentMethod() == null) {
            throw new BadRequestException("Payment method is required");
        }

        PaymentMethod paymentMethod = paymentDetails.getPaymentMethod();
        if (paymentMethod == PaymentMethod.CREDIT_CARD || paymentMethod == PaymentMethod.DEBIT_CARD) {
            validateCardPayment(paymentDetails);
        } else if (paymentMethod == PaymentMethod.UPI && isBlank(paymentDetails.getUpiId())) {
            throw new BadRequestException("UPI ID is required");
        } else if (paymentMethod == PaymentMethod.NET_BANKING && isBlank(paymentDetails.getBankName())) {
            throw new BadRequestException("Bank name is required");
        } else if (paymentMethod == PaymentMethod.WALLET && isBlank(paymentDetails.getWalletProvider())) {
            throw new BadRequestException("Wallet provider is required");
        }
    }

    private void validateCardPayment(PaymentDetailsRequest paymentDetails) {
        if (isBlank(paymentDetails.getCardholderName())) {
            throw new BadRequestException("Cardholder name is required");
        }
        if (isBlank(paymentDetails.getCardNumber())) {
            throw new BadRequestException("Card number is required");
        }
        if (!isValidLuhn(paymentDetails.getCardNumber())) {
            throw new BadRequestException("Card number is invalid");
        }
        if (paymentDetails.getExpiryMonth() == null || paymentDetails.getExpiryYear() == null) {
            throw new BadRequestException("Card expiry month and year are required");
        }
        YearMonth expiry;
        try {
            expiry = YearMonth.of(paymentDetails.getExpiryYear(), paymentDetails.getExpiryMonth());
        } catch (RuntimeException ex) {
            throw new BadRequestException("Card expiry date is invalid");
        }
        if (expiry.isBefore(YearMonth.now())) {
            throw new BadRequestException("Card is expired");
        }
        if (isBlank(paymentDetails.getCvv())) {
            throw new BadRequestException("CVV is required");
        }
    }

    private void validateCart(List<Cart> cartItems) {
        if (cartItems == null || cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }
    }

    private Order buildOrder(User user, ShippingAddressRequest shippingAddress, PaymentDetailsRequest paymentDetails) {
        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.CONFIRMED)
                .paymentStatus(PaymentStatus.PENDING)
                .shippingAddress(formatShippingAddress(shippingAddress))
                .build();
        applyPaymentDetails(order, paymentDetails);
        return order;
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

    private void processPayment(Order order, PaymentDetailsRequest paymentDetails) {
        logger.info("Processing payment for order {}", order.getOrderNumber());

        if (order.getTotalAmount() == null || order.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new PaymentProcessingException("Order amount must be greater than zero");
        }

        try {
            // Placeholder for actual payment integration.
            // Replace this stub with the real payment gateway call.
            if (paymentDetails.getPaymentMethod() == PaymentMethod.CREDIT_CARD && order.getTotalAmount().compareTo(new BigDecimal("100000")) > 0) {
                throw new PaymentProcessingException("Credit card transaction was declined");
            }
            order.setPaymentStatus(PaymentStatus.PAID);
            order.setPaymentReference("PAY-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase());
            order.setPaymentFailureReason(null);
            order.setStatus(OrderStatus.CONFIRMED);
            logger.info("Payment processing succeeded for order {}", order.getOrderNumber());
        } catch (RuntimeException ex) {
            order.setPaymentStatus(PaymentStatus.FAILED);
            order.setPaymentFailureReason(ex.getMessage());
            order.setStatus(OrderStatus.CANCELLED);
            logger.error("Payment processing failed for order {}", order.getOrderNumber(), ex);
            throw ex;
        } catch (Exception ex) {
            order.setPaymentStatus(PaymentStatus.FAILED);
            order.setPaymentFailureReason("Payment processing failed");
            order.setStatus(OrderStatus.CANCELLED);
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
        return toCheckoutResponse(order, "Checkout completed successfully");
    }

    private CheckoutResponse toCheckoutResponse(Order order, String message) {
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
                message,
                order.getOrderId(),
                order.getOrderNumber(),
                order.getUser().getUserId(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getPaymentMethod(),
                order.getPaymentStatus(),
                order.getPaymentReference(),
                order.getMaskedPaymentIdentifier(),
                order.getPaymentFailureReason(),
                order.getShippingAddress(),
                order.getOrderedAt(),
                itemResponses);
    }

    private Order getOwnedOrder(User user, int orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        boolean isOwner = order.getUser().getUserId() == user.getUserId();
        boolean isAdmin = "ADMIN".equalsIgnoreCase(user.getRole());

        if (!isOwner && !isAdmin) {
            throw new UnauthorizedException("Access denied to order");
        }

        return order;
    }

    private boolean isFinalOrder(Order order) {
        return order.getStatus() == OrderStatus.SHIPPED
                || order.getStatus() == OrderStatus.DELIVERED
                || order.getStatus() == OrderStatus.CANCELLED;
    }

    private void applyPaymentDetails(Order order, PaymentDetailsRequest paymentDetails) {
        order.setPaymentMethod(paymentDetails.getPaymentMethod());
        order.setMaskedPaymentIdentifier(maskPaymentIdentifier(paymentDetails));
    }

    private String formatShippingAddress(ShippingAddressRequest address) {
        String addressLine2 = isBlank(address.getAddressLine2()) ? "" : ", " + address.getAddressLine2().trim();
        return String.format(
                "%s, %s%s, %s, %s %s, %s, Phone: %s",
                address.getFullName().trim(),
                address.getAddressLine1().trim(),
                addressLine2,
                address.getCity().trim(),
                address.getState().trim(),
                address.getPostalCode().trim(),
                address.getCountry().trim(),
                address.getPhone().trim());
    }

    private String maskPaymentIdentifier(PaymentDetailsRequest paymentDetails) {
        PaymentMethod paymentMethod = paymentDetails.getPaymentMethod();
        if ((paymentMethod == PaymentMethod.CREDIT_CARD || paymentMethod == PaymentMethod.DEBIT_CARD)
                && !isBlank(paymentDetails.getCardNumber())) {
            String cardNumber = paymentDetails.getCardNumber();
            String lastFour = cardNumber.substring(cardNumber.length() - 4);
            return paymentMethod.name() + " ****" + lastFour;
        }
        if (paymentMethod == PaymentMethod.UPI) {
            return maskText(paymentDetails.getUpiId());
        }
        if (paymentMethod == PaymentMethod.NET_BANKING) {
            return paymentDetails.getBankName().trim();
        }
        if (paymentMethod == PaymentMethod.WALLET) {
            return paymentDetails.getWalletProvider().trim();
        }
        return paymentMethod.name();
    }

    private String maskText(String value) {
        if (isBlank(value)) {
            return null;
        }
        String trimmed = value.trim();
        int atIndex = trimmed.indexOf('@');
        if (atIndex <= 1) {
            return "***" + trimmed.substring(Math.max(atIndex, 0));
        }
        return trimmed.charAt(0) + "***" + trimmed.substring(atIndex);
    }

    private boolean isValidLuhn(String value) {
        int sum = 0;
        boolean doubleDigit = false;
        for (int i = value.length() - 1; i >= 0; i--) {
            int digit = Character.digit(value.charAt(i), 10);
            if (digit < 0) {
                return false;
            }
            if (doubleDigit) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            sum += digit;
            doubleDigit = !doubleDigit;
        }
        return sum % 10 == 0;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
