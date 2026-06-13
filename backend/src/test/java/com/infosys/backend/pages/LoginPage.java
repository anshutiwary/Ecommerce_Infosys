package com.infosys.backend.pages;

import java.time.Duration;

import com.infosys.backend.utilities.TestConfig;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import com.infosys.backend.utilities.WaitUtils;

public class LoginPage extends BasePage {

	private static final Duration LOGIN_WAIT = Duration.ofMillis(8000);
	private static final By LOGIN_FORM = By.cssSelector("form.register-form");
	private static final By LOGIN_HEADING = By.xpath("//h2[normalize-space()='Login']");
	private static final By EMAIL_INPUT = By.id("email");
	private static final By PASSWORD_INPUT = By.id("password");
	private static final By LOGIN_BUTTON = By.xpath("//button[@type='submit' and normalize-space()='Login']");
	private static final By REGISTER_LINK = By.xpath("//span[@role='button' and normalize-space()='Register']");
	private static final By STATUS_MESSAGE = By.cssSelector(".form-status");
	private static final By EMAIL_ERROR = By.xpath("//input[@name='email']/following-sibling::small[contains(@class,'field-error')]");
	private static final By PASSWORD_ERROR = By.xpath("//input[@name='password']/following-sibling::small[contains(@class,'field-error')]");

	public LoginPage(WebDriver driver) {
		super(driver);
	}

	public void open() {
		driver.get(TestConfig.BASE_URL + "login");
		waitForLoginPageLoaded();
	}

	public void enterEmail(String email) {
		enterText(EMAIL_INPUT, email);
		waitForInputValue(EMAIL_INPUT, email, LOGIN_WAIT);
	}

	public void enterPassword(String password) {
		enterText(PASSWORD_INPUT, password);
		waitForInputValue(PASSWORD_INPUT, password, LOGIN_WAIT);
	}

	public void submitLogin() {
		WaitUtils.waitForElementVisible(driver, LOGIN_BUTTON).sendKeys(Keys.ENTER);
	}

	public void login(String email, String password) {
		enterEmail(email);
		enterPassword(password);
		submitLogin();
	}

	public boolean waitForSuccessfulLoginNavigation() {
		return new WebDriverWait(driver, LOGIN_WAIT)
				.until(ExpectedConditions.not(ExpectedConditions.urlContains("/login")));
	}

	public boolean isLoginPageDisplayed() {
		return isElementDisplayed(LOGIN_HEADING);
	}

	public String getEmailErrorMessage() {
		return getText(EMAIL_ERROR);
	}

	public String getPasswordErrorMessage() {
		return getText(PASSWORD_ERROR);
	}

	public String getStatusMessage() {
		return getText(STATUS_MESSAGE);
	}

	public String getEmailValidationMessage() {
		return getValidationMessage(EMAIL_INPUT);
	}

	public String getPasswordValidationMessage() {
		return getValidationMessage(PASSWORD_INPUT);
	}

	private void waitForLoginPageLoaded() {
		WebDriverWait wait = new WebDriverWait(driver, LOGIN_WAIT);
		wait.until(ExpectedConditions.urlContains("/login"));
		wait.until(ExpectedConditions.visibilityOfElementLocated(LOGIN_FORM));
		wait.until(ExpectedConditions.visibilityOfElementLocated(LOGIN_HEADING));
	}

	public void clickRegisterLink() {
		clickElement(REGISTER_LINK);
	}
}
