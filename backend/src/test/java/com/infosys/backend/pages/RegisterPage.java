package com.infosys.backend.pages;

import java.time.Duration;

import com.infosys.backend.utilities.TestConfig;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import com.infosys.backend.utilities.WaitUtils;

public class RegisterPage extends BasePage {

	private static final Duration REGISTRATION_WAIT = Duration.ofMillis(8000);
	private static final By REGISTER_FORM = By.cssSelector("form.register-form");
	private static final By REGISTER_HEADING = By.xpath("//h2[normalize-space()='Register']");
	private static final By FULL_NAME_INPUT = By.id("name");
	private static final By EMAIL_INPUT = By.id("email");
	private static final By PHONE_INPUT = By.id("phone");
	private static final By PASSWORD_INPUT = By.id("password");
	private static final By CONFIRM_PASSWORD_INPUT = By.id("confirmPassword");
	private static final By CREATE_ACCOUNT_BUTTON = By.xpath("//button[@type='submit' and normalize-space()='Create Account']");
	private static final By LOGIN_LINK = By.xpath("//span[@role='button' and normalize-space()='Login']");
	private static final By STATUS_MESSAGE = By.cssSelector(".form-status");
	private static final By FULL_NAME_ERROR = By.xpath("//input[@name='name']/following-sibling::small[contains(@class,'field-error')]");
	private static final By EMAIL_ERROR = By.xpath("//input[@name='email']/following-sibling::small[contains(@class,'field-error')]");
	private static final By PHONE_ERROR = By.xpath("//input[@name='phone']/following-sibling::small[contains(@class,'field-error')]");
	private static final By PASSWORD_ERROR = By.xpath("//input[@name='password']/following-sibling::small[contains(@class,'field-error')]");
	private static final By CONFIRM_PASSWORD_ERROR = By.xpath("//input[@name='confirmPassword']/following-sibling::small[contains(@class,'field-error')]");

	public RegisterPage(WebDriver driver) {
		super(driver);
	}

	public void open() {
		new WebDriverWait(driver, REGISTRATION_WAIT)
				.until(currentDriver -> {
					try {
						currentDriver.get(TestConfig.BASE_URL + "register");
						return currentDriver.getCurrentUrl().contains("/register");
					} catch (WebDriverException exception) {
						return false;
					}
				});
		waitForRegistrationPageLoaded();
	}

	public void enterFullName(String fullName) {
		WaitUtils.waitForElementVisible(driver, FULL_NAME_INPUT).sendKeys(fullName);
		waitForInputValue(FULL_NAME_INPUT, fullName);
	}

	public void enterEmail(String email) {
		WaitUtils.waitForElementVisible(driver, EMAIL_INPUT).sendKeys(email);
		waitForInputValue(EMAIL_INPUT, email);
	}

	public void enterPhone(String phone) {
		WaitUtils.waitForElementVisible(driver, PHONE_INPUT).sendKeys(phone);
		waitForInputValue(PHONE_INPUT, acceptedPhoneValue(phone));
	}

	public void enterPassword(String password) {
		WaitUtils.waitForElementVisible(driver, PASSWORD_INPUT).sendKeys(password);
		waitForInputValue(PASSWORD_INPUT, password);
	}

	public void enterConfirmPassword(String confirmPassword) {
		WaitUtils.waitForElementVisible(driver, CONFIRM_PASSWORD_INPUT).sendKeys(confirmPassword);
		waitForInputValue(CONFIRM_PASSWORD_INPUT, confirmPassword);
	}

	public void submitRegistration() {
		WaitUtils.waitForElementVisible(driver, CREATE_ACCOUNT_BUTTON).sendKeys(Keys.ENTER);
	}

	public boolean isFullNameErrorDisplayed() {
		return waitForError(FULL_NAME_ERROR);
	}

	public boolean isFullNameInvalid() {
		return isInputInvalid(FULL_NAME_INPUT);
	}

	public boolean isEmailErrorDisplayed() {
		return waitForError(EMAIL_ERROR);
	}

	public boolean isEmailInvalid() {
		return isInputInvalid(EMAIL_INPUT);
	}

	public boolean isPhoneErrorDisplayed() {
		return waitForError(PHONE_ERROR);
	}

	public boolean isPhoneInvalid() {
		return isInputInvalid(PHONE_INPUT);
	}

	public boolean isPasswordErrorDisplayed() {
		return waitForError(PASSWORD_ERROR);
	}

	public boolean isPasswordInvalid() {
		return isInputInvalid(PASSWORD_INPUT);
	}

	public boolean isConfirmPasswordErrorDisplayed() {
		return waitForError(CONFIRM_PASSWORD_ERROR);
	}

	public boolean isConfirmPasswordInvalid() {
		return isInputInvalid(CONFIRM_PASSWORD_INPUT);
	}

	public String getFullNameValue() {
		return getInputValue(FULL_NAME_INPUT);
	}

	public String getEmailValue() {
		return getInputValue(EMAIL_INPUT);
	}

	public String getPhoneValue() {
		return getInputValue(PHONE_INPUT);
	}

	public String getPasswordValue() {
		return getInputValue(PASSWORD_INPUT);
	}

	public String getConfirmPasswordValue() {
		return getInputValue(CONFIRM_PASSWORD_INPUT);
	}

	public String getFullNameErrorMessage() {
		return getMessageText(FULL_NAME_ERROR);
	}

	public String getEmailErrorMessage() {
		return getMessageText(EMAIL_ERROR);
	}

	public String getPhoneErrorMessage() {
		return getMessageText(PHONE_ERROR);
	}

	public String getPasswordErrorMessage() {
		return getMessageText(PASSWORD_ERROR);
	}

	public String getConfirmPasswordErrorMessage() {
		return getMessageText(CONFIRM_PASSWORD_ERROR);
	}

	public String getFullNameValidationMessage() {
		return getValidationMessage(FULL_NAME_INPUT);
	}

	public String getEmailValidationMessage() {
		return getValidationMessage(EMAIL_INPUT);
	}

	public String getPhoneValidationMessage() {
		return getValidationMessage(PHONE_INPUT);
	}

	public String getPasswordValidationMessage() {
		return getValidationMessage(PASSWORD_INPUT);
	}

	public String getConfirmPasswordValidationMessage() {
		return getValidationMessage(CONFIRM_PASSWORD_INPUT);
	}

	public void registerUser(String fullName, String email, String phone, String password) {
		enterFullName(fullName);
		enterEmail(email);
		enterPhone(phone);
		enterPassword(password);
		enterConfirmPassword(password);
		submitRegistration();
	}

	public String getRegistrationStatusMessage() {
		return new WebDriverWait(driver, REGISTRATION_WAIT)
				.until(ExpectedConditions.visibilityOfElementLocated(STATUS_MESSAGE))
				.getText();
	}

	public boolean isRegistrationSuccessful() {
		return new WebDriverWait(driver, REGISTRATION_WAIT)
				.until(ExpectedConditions.textToBePresentInElementLocated(
						STATUS_MESSAGE,
						"Registration successful"));
	}

	private void waitForRegistrationPageLoaded() {
		WebDriverWait wait = new WebDriverWait(driver, REGISTRATION_WAIT);
		wait.until(ExpectedConditions.urlContains("/register"));
		wait.until(ExpectedConditions.visibilityOfElementLocated(REGISTER_FORM));
		wait.until(ExpectedConditions.visibilityOfElementLocated(REGISTER_HEADING));
	}

	private void waitForInputValue(By locator, String value) {
		new WebDriverWait(driver, REGISTRATION_WAIT)
				.until(ExpectedConditions.attributeToBe(locator, "value", value));
	}

	private boolean waitForError(By locator) {
		return new WebDriverWait(driver, REGISTRATION_WAIT)
				.until(ExpectedConditions.visibilityOfElementLocated(locator))
				.isDisplayed();
	}

	private String getInputValue(By locator) {
		return WaitUtils.waitForElementVisible(driver, locator).getAttribute("value");
	}

	private String getMessageText(By locator) {
		return new WebDriverWait(driver, REGISTRATION_WAIT)
				.until(ExpectedConditions.visibilityOfElementLocated(locator))
				.getText();
	}

	private String getValidationMessage(By locator) {
		return WaitUtils.waitForElementVisible(driver, locator).getAttribute("validationMessage");
	}

	private boolean isInputInvalid(By locator) {
		WebElement element = WaitUtils.waitForElementVisible(driver, locator);
		return Boolean.FALSE.equals(((JavascriptExecutor) driver)
				.executeScript("return arguments[0].checkValidity();", element));
	}

	private String acceptedPhoneValue(String phone) {
		return phone.length() > 10 ? phone.substring(0, 10) : phone;
	}

	public By registerForm() {
		return REGISTER_FORM;
	}

	public By registerHeading() {
		return REGISTER_HEADING;
	}

	public By fullNameInput() {
		return FULL_NAME_INPUT;
	}

	public By emailInput() {
		return EMAIL_INPUT;
	}

	public By phoneInput() {
		return PHONE_INPUT;
	}

	public By passwordInput() {
		return PASSWORD_INPUT;
	}

	public By confirmPasswordInput() {
		return CONFIRM_PASSWORD_INPUT;
	}

	public By createAccountButton() {
		return CREATE_ACCOUNT_BUTTON;
	}

	public By loginLink() {
		return LOGIN_LINK;
	}

	public By statusMessage() {
		return STATUS_MESSAGE;
	}

	public By fullNameError() {
		return FULL_NAME_ERROR;
	}

	public By emailError() {
		return EMAIL_ERROR;
	}

	public By phoneError() {
		return PHONE_ERROR;
	}

	public By passwordError() {
		return PASSWORD_ERROR;
	}

	public By confirmPasswordError() {
		return CONFIRM_PASSWORD_ERROR;
	}
}
