package com.infosys.backend.utilities;

import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public final class AlertUtils {

	private static final Duration ALERT_WAIT = Duration.ofSeconds(10);
	private static final By TOAST_POPUP = By.cssSelector(".toast-notification");
	private static final By TOAST_CLOSE_BUTTON = By.cssSelector(".toast-close");
	private static final By MODAL_POPUP = By.cssSelector(".product-modal-overlay");
	private static final By MODAL_CLOSE_BUTTON = By.cssSelector(".modal-close");

	private AlertUtils() {
	}

	public static Alert waitForAlert(WebDriver driver) {
		return new WebDriverWait(driver, ALERT_WAIT)
				.until(ExpectedConditions.alertIsPresent());
	}

	public static boolean isAlertPresent(WebDriver driver) {
		try {
			driver.switchTo().alert();
			return true;
		} catch (NoAlertPresentException exception) {
			return false;
		}
	}

	public static String getAlertText(WebDriver driver) {
		return waitForAlert(driver).getText();
	}

	public static void acceptAlert(WebDriver driver) {
		waitForAlert(driver).accept();
	}

	public static void dismissAlert(WebDriver driver) {
		waitForAlert(driver).dismiss();
	}

	public static void enterPromptText(WebDriver driver, String text) {
		waitForAlert(driver).sendKeys(text);
	}

	public static void acceptPrompt(WebDriver driver, String text) {
		Alert prompt = waitForAlert(driver);
		prompt.sendKeys(text);
		prompt.accept();
	}

	public static WebElement waitForToastPopup(WebDriver driver) {
		return WaitUtils.waitForElementVisible(driver, TOAST_POPUP);
	}

	public static void closeToastPopup(WebDriver driver) {
		WaitUtils.waitForElementClickable(driver, TOAST_CLOSE_BUTTON).click();
	}

	public static WebElement waitForModalPopup(WebDriver driver) {
		return WaitUtils.waitForElementVisible(driver, MODAL_POPUP);
	}

	public static void closeModalPopup(WebDriver driver) {
		WaitUtils.waitForElementClickable(driver, MODAL_CLOSE_BUTTON).click();
	}
}
