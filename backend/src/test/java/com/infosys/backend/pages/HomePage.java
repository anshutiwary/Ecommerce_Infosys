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
	private static final By SEARCH_INPUT = By.cssSelector(".store-search input");
	private static final By NO_RESULTS_MESSAGE = By.className("product-message");
	private static final By CATEGORY_FILTER = By.cssSelector("select[aria-label='Filter by category']");
	private static final By MAX_PRICE_FILTER = By.cssSelector("input[aria-label='Filter by max price']");
	private static final By CLEAR_FILTERS_BUTTON = By.xpath("//div[@class='store-filter-header']/button[text()='Clear']");
	private static final By PRODUCT_CATEGORY_LABEL = By.className("product-category");

	public HomePage(WebDriver driver) {
		super(driver);
	}

	public boolean isLogoutButtonDisplayed() {
		return new WebDriverWait(driver, LOGOUT_WAIT)
				.until(ExpectedConditions.visibilityOfElementLocated(LOGOUT_BUTTON))
				.isDisplayed();
	}

	public void clickLogout() {
		clickElement(LOGOUT_BUTTON);
	}

	public int getProductCount() {
		try {
			return WaitUtils.retryOnStaleElement(driver, d -> {
				WebElement grid = WaitUtils.waitForElementVisible(d, PRODUCT_GRID);
				return grid.findElements(PRODUCT_CARD).size();
			});
		} catch (Exception e) {
			// If PRODUCT_GRID is completely absent, it might throw TimeoutException
			return 0;
		}
	}

	public List<String> getProductTitles() {
		try {
			return WaitUtils.retryOnStaleElement(driver, d -> {
				List<WebElement> productCards = WaitUtils.waitForElementVisible(d, PRODUCT_GRID).findElements(PRODUCT_CARD);
				return productCards.stream()
						.map(card -> card.findElement(PRODUCT_TITLE).getText().trim())
						.collect(Collectors.toList());
			});
		} catch (Exception e) {
			return java.util.Collections.emptyList();
		}
	}

	public void clickProductDetails(int index) {
		WaitUtils.retryOnStaleElement(driver, d -> {
			List<WebElement> productCards = WaitUtils.waitForElementVisible(d, PRODUCT_GRID).findElements(PRODUCT_CARD);
			if (index >= 0 && index < productCards.size()) {
				WebElement card = productCards.get(index);
				WebElement link = card.findElement(VIEW_DETAILS_LINK);
				((JavascriptExecutor) d).executeScript("arguments[0].scrollIntoView({block: 'center'});", link);
				((JavascriptExecutor) d).executeScript("arguments[0].click();", link);
				return true;
			}
			throw new IndexOutOfBoundsException("Product index out of bounds: " + index);
		});
	}

	public String getProductTitle(int index) {
		return WaitUtils.retryOnStaleElement(driver, d -> {
			List<WebElement> productCards = WaitUtils.waitForElementVisible(d, PRODUCT_GRID).findElements(PRODUCT_CARD);
			if (index >= 0 && index < productCards.size()) {
				return productCards.get(index).findElement(PRODUCT_TITLE).getText().trim();
			}
			throw new IndexOutOfBoundsException("Product index out of bounds: " + index);
		});
	}

	public String getProductPrice(int index) {
		return WaitUtils.retryOnStaleElement(driver, d -> {
			List<WebElement> productCards = WaitUtils.waitForElementVisible(d, PRODUCT_GRID).findElements(PRODUCT_CARD);
			if (index >= 0 && index < productCards.size()) {
				return productCards.get(index).findElement(PRODUCT_PRICE).getText().trim();
			}
			throw new IndexOutOfBoundsException("Product index out of bounds: " + index);
		});
	}

	private List<WebElement> getProductCards() {
		try {
			return WaitUtils.retryOnStaleElement(driver, d -> WaitUtils.waitForElementVisible(d, PRODUCT_GRID).findElements(PRODUCT_CARD));
		} catch (Exception e) {
			return java.util.Collections.emptyList();
		}
	}

	public void enterSearchText(String text) {
		clearAndEnterTextRobustly(SEARCH_INPUT, text);
		WaitUtils.pause(1000); // Wait for React to filter products
	}

	public void clearSearch() {
		clearAndEnterTextRobustly(SEARCH_INPUT, "");
		WaitUtils.pause(1000);
	}

	public String getNoResultsMessage() {
		return getText(NO_RESULTS_MESSAGE);
	}

	public void selectCategoryFilter(String category) {
		WebElement categorySelect = WaitUtils.waitForElementVisible(driver, CATEGORY_FILTER);
		new org.openqa.selenium.support.ui.Select(categorySelect).selectByVisibleText(category);
		WaitUtils.pause(1000); // Wait for React to apply filter
	}

	public void enterMaxPriceFilter(String price) {
		clearAndEnterTextRobustly(MAX_PRICE_FILTER, price);
		WaitUtils.pause(1000); // Wait for React to apply filter
	}

	public void clickClearFilters() {
		clickElement(CLEAR_FILTERS_BUTTON);
		WaitUtils.pause(1000); // Wait for React to reset filters
	}

	public List<String> getDisplayedProductCategories() {
		try {
			return WaitUtils.retryOnStaleElement(driver, d -> {
				List<WebElement> productCards = WaitUtils.waitForElementVisible(d, PRODUCT_GRID).findElements(PRODUCT_CARD);
				return productCards.stream()
						.map(card -> card.findElement(PRODUCT_CATEGORY_LABEL).getText().trim())
						.collect(Collectors.toList());
			});
		} catch (Exception e) {
			return java.util.Collections.emptyList();
		}
	}

	public List<Double> getDisplayedProductPricesAsNumbers() {
		try {
			return WaitUtils.retryOnStaleElement(driver, d -> {
				List<WebElement> productCards = WaitUtils.waitForElementVisible(d, PRODUCT_GRID).findElements(PRODUCT_CARD);
				return productCards.stream()
						.map(card -> {
							String priceText = card.findElement(PRODUCT_PRICE).getText().trim();
							String numericString = priceText.replaceAll("[^\\d.]", "");
							try {
								return Double.parseDouble(numericString);
							} catch (NumberFormatException e) {
								return 0.0;
							}
						})
						.collect(Collectors.toList());
			});
		} catch (Exception e) {
			return java.util.Collections.emptyList();
		}
	}

	public boolean areAllProductNamesVisible() {
		return WaitUtils.retryOnStaleElement(driver, d -> {
			List<WebElement> cards = WaitUtils.waitForElementVisible(d, PRODUCT_GRID).findElements(PRODUCT_CARD);
			if (cards.isEmpty()) return false;
			return cards.stream().allMatch(card -> 
					!card.findElements(PRODUCT_TITLE).isEmpty() && card.findElement(PRODUCT_TITLE).isDisplayed());
		});
	}

	public boolean areAllProductImagesVisible() {
		return WaitUtils.retryOnStaleElement(driver, d -> {
			List<WebElement> cards = WaitUtils.waitForElementVisible(d, PRODUCT_GRID).findElements(PRODUCT_CARD);
			if (cards.isEmpty()) return false;
			return cards.stream().allMatch(card -> {
				boolean hasImage = !card.findElements(PRODUCT_IMAGE).isEmpty() && card.findElement(PRODUCT_IMAGE).isDisplayed();
				boolean hasFallback = !card.findElements(PRODUCT_IMAGE_FALLBACK).isEmpty() && card.findElement(PRODUCT_IMAGE_FALLBACK).isDisplayed();
				return hasImage || hasFallback;
			});
		});
	}

	public boolean areAllProductPricesVisible() {
		return WaitUtils.retryOnStaleElement(driver, d -> {
			List<WebElement> cards = WaitUtils.waitForElementVisible(d, PRODUCT_GRID).findElements(PRODUCT_CARD);
			if (cards.isEmpty()) return false;
			return cards.stream().allMatch(card -> 
					!card.findElements(PRODUCT_PRICE).isEmpty() && card.findElement(PRODUCT_PRICE).isDisplayed());
		});
	}

	public boolean areAllProductDescriptionsVisible() {
		return WaitUtils.retryOnStaleElement(driver, d -> {
			List<WebElement> cards = WaitUtils.waitForElementVisible(d, PRODUCT_GRID).findElements(PRODUCT_CARD);
			if (cards.isEmpty()) return false;
			return cards.stream().allMatch(card -> 
					!card.findElements(PRODUCT_DESCRIPTION).isEmpty() && card.findElement(PRODUCT_DESCRIPTION).isDisplayed());
		});
	}
}
