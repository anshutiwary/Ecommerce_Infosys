package com.infosys.backend.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.infosys.backend.model.OrderStatus;
import com.infosys.backend.model.PaymentMethod;
import com.infosys.backend.model.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutResponse {

    private String message;
    private int orderId;
    private String orderNumber;
    private int userId;
    private BigDecimal totalAmount;
    private OrderStatus orderStatus;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private String paymentReference;
    private String maskedPaymentIdentifier;
    private String paymentFailureReason;
    private String shippingAddress;
    private Instant orderedAt;
    private List<CheckoutItemResponse> items;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CheckoutItemResponse {

        private int orderItemId;
        private int productId;
        private String productName;
        private int quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
    }
}
