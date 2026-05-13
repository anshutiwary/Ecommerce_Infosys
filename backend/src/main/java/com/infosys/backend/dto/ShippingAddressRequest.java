package com.infosys.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ShippingAddressRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9+\\-\\s()]{7,20}$", message = "Phone number is invalid")
    private String phone;

    @NotBlank(message = "Address line 1 is required")
    @Size(min = 5, max = 150, message = "Address line 1 must be between 5 and 150 characters")
    private String addressLine1;

    @Size(max = 150, message = "Address line 2 must not exceed 150 characters")
    private String addressLine2;

    @NotBlank(message = "City is required")
    @Size(min = 2, max = 80, message = "City must be between 2 and 80 characters")
    private String city;

    @NotBlank(message = "State is required")
    @Size(min = 2, max = 80, message = "State must be between 2 and 80 characters")
    private String state;

    @NotBlank(message = "Postal code is required")
    @Pattern(regexp = "^[A-Za-z0-9\\-\\s]{3,12}$", message = "Postal code is invalid")
    private String postalCode;

    @NotBlank(message = "Country is required")
    @Size(min = 2, max = 80, message = "Country must be between 2 and 80 characters")
    private String country;
}
