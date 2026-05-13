package com.infosys.backend.dto;

import com.infosys.backend.model.PaymentMethod;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PaymentDetailsRequest {

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    @Size(max = 120, message = "Cardholder name must not exceed 120 characters")
    private String cardholderName;

    @Pattern(regexp = "^$|^[0-9]{12,19}$", message = "Card number is invalid")
    private String cardNumber;

    @Min(value = 1, message = "Expiry month must be between 1 and 12")
    @Max(value = 12, message = "Expiry month must be between 1 and 12")
    private Integer expiryMonth;

    @Min(value = 2000, message = "Expiry year is invalid")
    @Max(value = 2100, message = "Expiry year is invalid")
    private Integer expiryYear;

    @Pattern(regexp = "^$|^[0-9]{3,4}$", message = "CVV is invalid")
    private String cvv;

    @Pattern(regexp = "^$|^[A-Za-z0-9._%+-]{2,}@[A-Za-z0-9.-]{2,}$", message = "UPI ID is invalid")
    private String upiId;

    @Size(max = 80, message = "Bank name must not exceed 80 characters")
    private String bankName;

    @Size(max = 80, message = "Wallet provider must not exceed 80 characters")
    private String walletProvider;

    @Size(max = 120, message = "Payment token must not exceed 120 characters")
    private String paymentToken;
}
