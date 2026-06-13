package com.infosys.backend.pages;

import org.openqa.selenium.WebDriver;

public abstract class BasePage {

	protected final WebDriver driver;

	protected BasePage(WebDriver driver) {
		this.driver = driver;
	}

	public String getCurrentUrl() {
		return driver.getCurrentUrl();
	}

	public boolean waitForUrlContains(String text) {
		return com.infosys.backend.utilities.WaitUtils.waitForUrlContains(driver, text);
	}

	protected void enterText(org.openqa.selenium.By locator, String text) {
		org.openqa.selenium.WebElement element = com.infosys.backend.utilities.WaitUtils.waitForElementVisible(driver, locator);
		element.sendKeys(text);
	}

	protected void clearAndEnterTextRobustly(org.openqa.selenium.By locator, String text) {
		org.openqa.selenium.WebElement element = com.infosys.backend.utilities.WaitUtils.waitForElementVisible(driver, locator);
		element.sendKeys(org.openqa.selenium.Keys.chord(org.openqa.selenium.Keys.COMMAND, "a"), org.openqa.selenium.Keys.BACK_SPACE);
		element.sendKeys(org.openqa.selenium.Keys.chord(org.openqa.selenium.Keys.CONTROL, "a"), org.openqa.selenium.Keys.BACK_SPACE);
		element.clear();
		element.sendKeys(text);
	}

	protected void clickElement(org.openqa.selenium.By locator) {
		com.infosys.backend.utilities.WaitUtils.waitForElementClickable(driver, locator).click();
	}

	protected void clickElementWithJS(org.openqa.selenium.WebElement element) {
		((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", element);
		((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].click();", element);
	}

	protected String getText(org.openqa.selenium.By locator) {
		return com.infosys.backend.utilities.WaitUtils.waitForElementVisible(driver, locator).getText().trim();
	}

	protected String getInputValue(org.openqa.selenium.By locator) {
		return com.infosys.backend.utilities.WaitUtils.waitForElementVisible(driver, locator).getAttribute("value");
	}

	protected String getValidationMessage(org.openqa.selenium.By locator) {
		return com.infosys.backend.utilities.WaitUtils.waitForElementVisible(driver, locator).getAttribute("validationMessage");
	}

	protected boolean isElementDisplayed(org.openqa.selenium.By locator) {
		try {
			return com.infosys.backend.utilities.WaitUtils.waitForElementVisible(driver, locator).isDisplayed();
		} catch (Exception e) {
			return false;
		}
	}

	protected void waitForInputValue(org.openqa.selenium.By locator, String value, java.time.Duration waitTime) {
		new org.openqa.selenium.support.ui.WebDriverWait(driver, waitTime)
				.until(org.openqa.selenium.support.ui.ExpectedConditions.attributeToBe(locator, "value", value));
	}
}
