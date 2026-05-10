package com.infosys.backend.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.backend.dto.CheckoutResponse;
import com.infosys.backend.dto.CheckoutResponse.CheckoutItemResponse;
import com.infosys.backend.model.Cart;
import com.infosys.backend.model.Order;
import com.infosys.backend.model.OrderItem;
import com.infosys.backend.model.OrderStatus;
import com.infosys.backend.model.Product;
import com.infosys.backend.model.User;
import com.infosys.backend.repository.CartRepository;
import com.infosys.backend.repository.OrderRepository;
import com.infosys.backend.repository.ProductRepository;

@Service
public class CheckoutService {

    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public CheckoutService(CartRepository cartRepository, OrderRepository orderRepository, ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public CheckoutResponse checkout(User user, String shippingAddress) {
        if (shippingAddress == null || shippingAddress.isBlank()) {
            throw new RuntimeException("Shipping address is required");
        }

        List<Cart> cartItems = cartRepository.findByUser(user);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PENDING)
                .shippingAddress(shippingAddress.trim())
                .build();
        BigDecimal totalAmount = calculateTotalPrice(cartItems);

        for (Cart cartItem : cartItems) {
            Product product = cartItem.getProduct();
            int requestedQuantity = cartItem.getQuantity();

            validateProduct(product, requestedQuantity);

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(requestedQuantity)
                    .unitPrice(product.getPrice())
                    .build();
            orderItem.calculateSubtotal();

            order.addOrderItem(orderItem);
            totalAmount = totalAmount.add(orderItem.getSubtotal());
            product.setQuantity(product.getQuantity() - requestedQuantity);
        }

        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);
        productRepository.saveAll(cartItems.stream().map(Cart::getProduct).toList());
        cartRepository.deleteByUser(user);

        return toCheckoutResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<CheckoutResponse> getOrdersByUser(User user) {
        return orderRepository.findByUserOrderByOrderedAtDesc(user).stream()
                .map(this::toCheckoutResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CheckoutResponse> getAllOrders() {
        return orderRepository.findAllByOrderByOrderedAtDesc().stream()
                .map(this::toCheckoutResponse)
                .toList();
    }

    @Transactional
    public CheckoutResponse approveOrder(int orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Only pending orders can be approved");
        }

        order.setStatus(OrderStatus.APPROVED);
        return toCheckoutResponse(orderRepository.save(order));
    }

    private void validateProduct(Product product, int requestedQuantity) {
        if (product == null) {
            throw new RuntimeException("Product not found");
        }

        if (requestedQuantity <= 0) {
            throw new RuntimeException("Cart item quantity must be greater than zero");
        }

        if (Boolean.FALSE.equals(product.getIsActive())) {
            throw new RuntimeException("Product is not available: " + product.getName());
        }

        if (product.getPrice() == null) {
            throw new RuntimeException("Product price is missing: " + product.getName());
        }

        if (product.getQuantity() < requestedQuantity) {
            throw new RuntimeException("Insufficient stock for product: " + product.getName());
        }
    }

    public BigDecimal calculateTotalPrice(List<Cart> cartItems) {
        if (cartItems == null || cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        return cartItems.stream()
                .map(this::calculateCartItemTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateCartItemTotal(Cart cartItem) {
        if (cartItem == null || cartItem.getProduct() == null) {
            throw new RuntimeException("Invalid cart item");
        }

        Product product = cartItem.getProduct();
        int quantity = cartItem.getQuantity();

        if (quantity <= 0) {
            throw new RuntimeException("Cart item quantity must be greater than zero");
        }

        if (product.getPrice() == null) {
            throw new RuntimeException("Product price is missing: " + product.getName());
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
                order.getUser().getUserId(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getShippingAddress(),
                order.getOrderedAt(),
                itemResponses);
    }
}
