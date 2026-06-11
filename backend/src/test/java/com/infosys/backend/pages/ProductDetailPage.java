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
        try {
            WebElement titleElement = new WebDriverWait(driver, Duration.ofSeconds(10))
                    .until(ExpectedConditions.visibilityOfElementLocated(PRODUCT_TITLE));
            return titleElement.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isProductPriceDisplayed() {
        try {
            WebElement priceElement = new WebDriverWait(driver, Duration.ofSeconds(10))
                    .until(ExpectedConditions.visibilityOfElementLocated(PRODUCT_PRICE));
            return priceElement.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public String getProductName() {
        return WaitUtils.waitForElementVisible(driver, PRODUCT_TITLE).getText().trim();
    }

    public String getProductPrice() {
        return WaitUtils.waitForElementVisible(driver, PRODUCT_PRICE).getText().trim();
    }
}
