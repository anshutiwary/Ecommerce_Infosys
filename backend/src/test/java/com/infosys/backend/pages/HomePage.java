package com.infosys.backend.pages;

import com.infosys.backend.utilities.WaitUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class HomePage extends BasePage {

	private static final Duration LOGOUT_WAIT = Duration.ofMillis(8000);
	private static final By LOGOUT_BUTTON = By.xpath("//button[normalize-space()='Logout']");

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
}
