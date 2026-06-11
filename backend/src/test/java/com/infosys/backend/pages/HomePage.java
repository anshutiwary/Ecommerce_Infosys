package com.infosys.backend.pages;

import com.infosys.backend.utilities.WaitUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;

import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

public class HomePage extends BasePage {

	private static final Duration LOGOUT_WAIT = Duration.ofMillis(8000);
	private static final By LOGOUT_BUTTON = By.xpath("//button[normalize-space()='Logout']");

	private static final By PRODUCT_GRID = By.className("store-grid");
	private static final By PRODUCT_CARD = By.className("store-card");
	private static final By PRODUCT_TITLE = By.tagName("h3");
	private static final By PRODUCT_PRICE = By.tagName("strong");
	private static final By PRODUCT_DESCRIPTION = By.className("product-description");
	private static final By PRODUCT_IMAGE = By.tagName("img");
	private static final By PRODUCT_IMAGE_FALLBACK = By.className("product-image-fallback");
	private static final By VIEW_DETAILS_LINK = By.className("view-details-link");

	public HomePage(WebDriver driver) {
		super(driver);
	}

	public boolean isLogoutButtonDisplayed() {
		return new WebDriverWait(driver, LOGOUT_WAIT)
				.until(ExpectedConditions.visibilityOfElementLocated(LOGOUT_BUTTON))
				.isDisplayed();
	}

	public void clickLogout() {
		WaitUtils.waitForElementClickable(driver, LOGOUT_BUTTON).click();
	}

	public int getProductCount() {
		return WaitUtils.waitForElementVisible(driver, PRODUCT_GRID)
				.findElements(PRODUCT_CARD).size();
	}

	public List<String> getProductTitles() {
		List<WebElement> productCards = WaitUtils.waitForElementVisible(driver, PRODUCT_GRID)
				.findElements(PRODUCT_CARD);
		
		return productCards.stream()
				.map(card -> card.findElement(PRODUCT_TITLE).getText())
				.collect(Collectors.toList());
	}

	public void clickProductDetails(int index) {
		List<WebElement> productCards = WaitUtils.waitForElementVisible(driver, PRODUCT_GRID)
				.findElements(PRODUCT_CARD);
		
		if (index >= 0 && index < productCards.size()) {
			WebElement card = productCards.get(index);
			WebElement link = card.findElement(VIEW_DETAILS_LINK);
			
			// Scroll into view to ensure it's loaded, then click using JS to avoid interception
			((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", link);
			((JavascriptExecutor) driver).executeScript("arguments[0].click();", link);
		} else {
			throw new IndexOutOfBoundsException("Product index out of bounds: " + index);
		}
	}

	private List<WebElement> getProductCards() {
		return WaitUtils.waitForElementVisible(driver, PRODUCT_GRID).findElements(PRODUCT_CARD);
	}

	public boolean areAllProductNamesVisible() {
		List<WebElement> cards = getProductCards();
		if (cards.isEmpty()) return false;
		return cards.stream().allMatch(card -> 
				!card.findElements(PRODUCT_TITLE).isEmpty() && card.findElement(PRODUCT_TITLE).isDisplayed());
	}

	public boolean areAllProductImagesVisible() {
		List<WebElement> cards = getProductCards();
		if (cards.isEmpty()) return false;
		return cards.stream().allMatch(card -> {
			boolean hasImage = !card.findElements(PRODUCT_IMAGE).isEmpty() && card.findElement(PRODUCT_IMAGE).isDisplayed();
			boolean hasFallback = !card.findElements(PRODUCT_IMAGE_FALLBACK).isEmpty() && card.findElement(PRODUCT_IMAGE_FALLBACK).isDisplayed();
			return hasImage || hasFallback;
		});
	}

	public boolean areAllProductPricesVisible() {
		List<WebElement> cards = getProductCards();
		if (cards.isEmpty()) return false;
		return cards.stream().allMatch(card -> 
				!card.findElements(PRODUCT_PRICE).isEmpty() && card.findElement(PRODUCT_PRICE).isDisplayed());
	}

	public boolean areAllProductDescriptionsVisible() {
		List<WebElement> cards = getProductCards();
		if (cards.isEmpty()) return false;
		return cards.stream().allMatch(card -> 
				!card.findElements(PRODUCT_DESCRIPTION).isEmpty() && card.findElement(PRODUCT_DESCRIPTION).isDisplayed());
	}
}
