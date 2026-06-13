package com.infosys.backend.pages;

import com.infosys.backend.utilities.WaitUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class ProductDetailPage extends BasePage {
    private static final By PRODUCT_TITLE = By.cssSelector(".product-header h1");
    private static final By PRODUCT_PRICE = By.className("product-price");

    public ProductDetailPage(WebDriver driver) {
        super(driver);
    }

    public boolean isProductTitleDisplayed() {
        return isElementDisplayed(PRODUCT_TITLE);
    }

    public boolean isProductPriceDisplayed() {
        return isElementDisplayed(PRODUCT_PRICE);
    }

    public String getProductName() {
        return getText(PRODUCT_TITLE);
    }

    public String getProductPrice() {
        return getText(PRODUCT_PRICE);
    }
}
