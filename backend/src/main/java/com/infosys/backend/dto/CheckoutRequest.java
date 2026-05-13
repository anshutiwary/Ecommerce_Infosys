package com.infosys.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CheckoutRequest {

    @Valid
    @NotNull(message = "Shipping address is required")
    private ShippingAddressRequest shippingAddress;

    @Valid
    @NotNull(message = "Payment details are required")
    private PaymentDetailsRequest paymentDetails;
}
