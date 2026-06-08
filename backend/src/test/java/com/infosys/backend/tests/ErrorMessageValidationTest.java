package com.infosys.backend.tests;

import com.infosys.backend.base.BaseTest;
import com.infosys.backend.pages.LoginPage;
import com.infosys.backend.pages.RegisterPage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ErrorMessageValidationTest extends BaseTest {

	@Test
	public void shouldValidateLoginMandatoryFieldMessages() {
		LoginPage loginPage = new LoginPage(driver);

		loginPage.open();
		loginPage.submitLogin();

		assertMessage(loginPage.getEmailValidationMessage(), "Please fill in this field.");
		assertMessage(loginPage.getPasswordValidationMessage(), "Please fill in this field.");
	}

	@Test
	public void shouldValidateLoginInvalidEmailMessage() {
		LoginPage loginPage = new LoginPage(driver);

		loginPage.open();
		loginPage.enterEmail("abhishek");
		loginPage.enterPassword("abhi@1234");
		loginPage.submitLogin();

		assertMessage(
				loginPage.getEmailValidationMessage(),
				"Please include an '@' in the email address. 'abhishek' is missing an '@'.");
	}

	@Test
	public void shouldValidateRegistrationMandatoryFieldMessages() {
		RegisterPage registerPage = new RegisterPage(driver);

		registerPage.open();
		registerPage.submitRegistration();

		assertMessage(registerPage.getFullNameValidationMessage(), "Please fill in this field.");
		assertMessage(registerPage.getEmailValidationMessage(), "Please fill in this field.");
		assertMessage(registerPage.getPhoneValidationMessage(), "Please fill in this field.");
		assertMessage(registerPage.getPasswordValidationMessage(), "Please fill in this field.");
	}

	@Test
	public void shouldValidateRegistrationInvalidEmailMessage() {
		RegisterPage registerPage = new RegisterPage(driver);

		registerPage.open();
		registerPage.enterFullName("Abhishek");
		registerPage.enterEmail("abhishek");
		registerPage.enterPhone("9876543210");
		registerPage.enterPassword("Abhi@1234");
		registerPage.enterConfirmPassword("Abhi@1234");
		registerPage.submitRegistration();

		assertMessage(
				registerPage.getEmailValidationMessage(),
				"Please include an '@' in the email address. 'abhishek' is missing an '@'.");
	}

	@Test
	public void shouldValidateRegistrationInvalidPhoneMessage() {
		RegisterPage registerPage = new RegisterPage(driver);

		registerPage.open();
		registerPage.enterFullName("Abhishek");
		registerPage.enterEmail("abhishek.validation@gmail.com");
		registerPage.enterPhone("12345");
		registerPage.enterPassword("Abhi@1234");
		registerPage.enterConfirmPassword("Abhi@1234");
		registerPage.submitRegistration();

		assertMessage(registerPage.getPhoneErrorMessage(), "Phone number must be exactly 10 digits.");
	}

	@Test
	public void shouldValidateRegistrationWeakPasswordMessage() {
		RegisterPage registerPage = new RegisterPage(driver);

		registerPage.open();
		registerPage.enterFullName("Abhishek");
		registerPage.enterEmail("abhishek.validation@gmail.com");
		registerPage.enterPhone("9876543210");
		registerPage.enterPassword("abhi1234");
		registerPage.enterConfirmPassword("abhi1234");
		registerPage.submitRegistration();

		assertMessage(
				registerPage.getPasswordErrorMessage(),
				"Password must be 8+ characters and include uppercase, lowercase, number, and special character.");
	}

	@Test
	public void shouldValidateRegistrationPasswordMismatchMessage() {
		RegisterPage registerPage = new RegisterPage(driver);

		registerPage.open();
		registerPage.enterFullName("Abhishek");
		registerPage.enterEmail("abhishek.validation@gmail.com");
		registerPage.enterPhone("9876543210");
		registerPage.enterPassword("Abhi@1234");
		registerPage.enterConfirmPassword("Abhi@12345");
		registerPage.submitRegistration();

		assertMessage(registerPage.getConfirmPasswordErrorMessage(), "Passwords do not match.");
	}

	private void assertMessage(String actualMessage, String expectedMessage) {
		Assert.assertNotNull(actualMessage, "Displayed message should not be null.");
		Assert.assertEquals(actualMessage, expectedMessage);
		Assert.assertFalse(actualMessage.isBlank(), "Displayed message should not be blank.");
	}
}
