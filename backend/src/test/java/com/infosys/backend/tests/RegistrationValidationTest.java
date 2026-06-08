package com.infosys.backend.tests;

import com.infosys.backend.base.BaseTest;
import com.infosys.backend.pages.RegisterPage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class RegistrationValidationTest extends BaseTest {

	@Test
	public void shouldShowErrorsForMandatoryFields() {
		RegisterPage registerPage = new RegisterPage(driver);

		registerPage.open();
		registerPage.submitRegistration();

		assertRequiredFieldInvalid(registerPage.isFullNameInvalid(), "Full name should be mandatory.");
		assertRequiredFieldInvalid(registerPage.isEmailInvalid(), "Email should be mandatory.");
		assertRequiredFieldInvalid(registerPage.isPhoneInvalid(), "Phone should be mandatory.");
		assertRequiredFieldInvalid(registerPage.isPasswordInvalid(), "Password should be mandatory.");
	}

	@Test
	public void shouldShowErrorForInvalidEmail() {
		RegisterPage registerPage = new RegisterPage(driver);

		registerPage.open();
		registerPage.enterFullName("Abhishek");
		registerPage.enterEmail("abhishek");
		registerPage.enterPhone("9876543210");
		registerPage.enterPassword("Abhi@1234");
		registerPage.enterConfirmPassword("Abhi@1234");
		registerPage.submitRegistration();

		Assert.assertTrue(registerPage.isEmailInvalid(), "Invalid email should be rejected.");
		Assert.assertFalse(registerPage.isPhoneInvalid(), "Valid phone should remain accepted.");
	}

	@Test
	public void shouldShowErrorForInvalidPhone() {
		RegisterPage registerPage = new RegisterPage(driver);

		registerPage.open();
		registerPage.enterFullName("Abhishek");
		registerPage.enterEmail("abhishek.validation@gmail.com");
		registerPage.enterPhone("12345");
		registerPage.enterPassword("Abhi@1234");
		registerPage.enterConfirmPassword("Abhi@1234");
		registerPage.submitRegistration();

		Assert.assertTrue(registerPage.isPhoneErrorDisplayed(), "Invalid phone error should be displayed.");
		Assert.assertFalse(registerPage.isEmailInvalid(), "Valid email should remain accepted.");
	}

	@Test
	public void shouldShowErrorForWeakPassword() {
		RegisterPage registerPage = new RegisterPage(driver);

		registerPage.open();
		registerPage.enterFullName("Abhishek");
		registerPage.enterEmail("abhishek.validation@gmail.com");
		registerPage.enterPhone("9876543210");
		registerPage.enterPassword("abhi1234");
		registerPage.enterConfirmPassword("abhi1234");
		registerPage.submitRegistration();

		Assert.assertTrue(registerPage.isPasswordErrorDisplayed(), "Weak password error should be displayed.");
		Assert.assertFalse(registerPage.isConfirmPasswordInvalid(), "Matching confirm password should remain accepted.");
	}

	@Test
	public void shouldShowErrorForPasswordMismatch() {
		RegisterPage registerPage = new RegisterPage(driver);

		registerPage.open();
		registerPage.enterFullName("Abhishek");
		registerPage.enterEmail("abhishek.validation@gmail.com");
		registerPage.enterPhone("9876543210");
		registerPage.enterPassword("Abhi@1234");
		registerPage.enterConfirmPassword("Abhi@12345");
		registerPage.submitRegistration();

		Assert.assertTrue(registerPage.isConfirmPasswordErrorDisplayed(), "Password mismatch error should be displayed.");
		Assert.assertFalse(registerPage.isPasswordInvalid(), "Valid password format should remain accepted.");
	}

	@Test
	public void shouldAcceptValidFieldValuesAndRestrictPhoneLength() {
		RegisterPage registerPage = new RegisterPage(driver);

		registerPage.open();
		registerPage.enterFullName("Abhishek");
		registerPage.enterEmail("abhishek.validation@gmail.com");
		registerPage.enterPhone("98765432109876");
		registerPage.enterPassword("Abhi@1234");
		registerPage.enterConfirmPassword("Abhi@1234");

		assertFieldValue(registerPage.getFullNameValue(), "Abhishek");
		assertFieldValue(registerPage.getEmailValue(), "abhishek.validation@gmail.com");
		assertFieldValue(registerPage.getPhoneValue(), "9876543210");
		assertFieldValue(registerPage.getPasswordValue(), "Abhi@1234");
		assertFieldValue(registerPage.getConfirmPasswordValue(), "Abhi@1234");
	}

	private void assertRequiredFieldInvalid(boolean actual, String message) {
		Assert.assertTrue(actual, message);
	}

	private void assertFieldValue(String actual, String expected) {
		Assert.assertNotNull(actual, "Field value should not be null.");
		Assert.assertEquals(actual, expected);
		Assert.assertFalse(actual.isBlank(), "Field value should not be blank.");
	}
}
