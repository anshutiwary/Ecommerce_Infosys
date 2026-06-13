package com.infosys.backend.utilities;

import java.time.Duration;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public final class WaitUtils {

	private static final Duration IMPLICIT_WAIT = Duration.ofSeconds(5);
	private static final Duration EXPLICIT_WAIT = Duration.ofMillis(8000);
	private static final Duration TEST_COMPLETION_WAIT = Duration.ofMillis(8000);

	private WaitUtils() {
	}

	public static void applyImplicitWait(WebDriver driver) {
		driver.manage().timeouts().implicitlyWait(IMPLICIT_WAIT);
	}

	public static WebElement waitForElementVisible(WebDriver driver, By locator) {
		return new WebDriverWait(driver, EXPLICIT_WAIT)
				.until(ExpectedConditions.visibilityOfElementLocated(locator));
	}

	public static WebElement waitForElementClickable(WebDriver driver, By locator) {
		WebElement element = waitForElementVisible(driver, locator);
		((JavascriptExecutor) driver).executeScript(
				"arguments[0].scrollIntoView({block: 'center'});",
				element);

		return new WebDriverWait(driver, EXPLICIT_WAIT)
				.until(ExpectedConditions.elementToBeClickable(element));
	}

	public static boolean waitForUrlContains(WebDriver driver, String urlFragment) {
		return new WebDriverWait(driver, EXPLICIT_WAIT)
				.until(ExpectedConditions.urlContains(urlFragment));
	}

	public static void waitBeforeClosingBrowser() {
		try {
			Thread.sleep(TEST_COMPLETION_WAIT.toMillis());
		} catch (InterruptedException exception) {
			Thread.currentThread().interrupt();
		}
	}

	public static void pause(int milliseconds) {
		try {
			Thread.sleep(milliseconds);
		} catch (InterruptedException exception) {
			Thread.currentThread().interrupt();
		}
	}

	public static <T> T retryOnStaleElement(WebDriver driver, java.util.function.Function<WebDriver, T> function) {
		return new WebDriverWait(driver, EXPLICIT_WAIT)
				.ignoring(org.openqa.selenium.StaleElementReferenceException.class)
				.until(function);
	}

	public static java.util.List<WebElement> waitForElementsVisible(WebDriver driver, By locator) {
		return new WebDriverWait(driver, EXPLICIT_WAIT)
				.ignoring(org.openqa.selenium.StaleElementReferenceException.class)
				.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(locator));
	}
}
