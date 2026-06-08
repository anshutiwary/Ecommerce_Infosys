package com.infosys.backend.tests;

import com.infosys.backend.base.BaseTest;
import com.infosys.backend.pages.LoginPage;
import com.infosys.backend.pages.RegisterPage;
import com.infosys.backend.utilities.AlertUtils;
import com.infosys.backend.utilities.TestConfig;
import com.infosys.backend.utilities.WaitUtils;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.testng.Assert;	
import org.testng.annotations.Test;

public class SingleFlowSession extends BaseTest {

	@Test
	public void executeEndToEndSession() {

		driver.get(TestConfig.BASE_URL + "register");
		RegisterPage registerPage = new RegisterPage(driver);
		Assert.assertTrue(WaitUtils.waitForElementVisible(driver, registerPage.registerHeading()).isDisplayed(), "Register page should load.");


		registerPage.submitRegistration();
		Assert.assertTrue(registerPage.isFullNameInvalid(), "Name validation should trigger.");
		Assert.assertTrue(registerPage.isEmailInvalid(), "Email validation should trigger.");


		String uniqueEmail = "e2e_user_" + System.currentTimeMillis() + "@example.com";
		registerPage.registerUser("End To End User", uniqueEmail, "1234567890", "E2eTest@1234");
		Assert.assertTrue(registerPage.isRegistrationSuccessful(), "Registration should complete successfully.");


		WaitUtils.waitForElementVisible(driver, registerPage.loginLink()).click();
		LoginPage loginPage = new LoginPage(driver);
		Assert.assertTrue(loginPage.isLoginPageDisplayed(), "Login page should display after clicking link.");


		loginPage.submitLogin();
		Assert.assertEquals(loginPage.getEmailValidationMessage(), "Please fill in this field.", "Email validation message should match.");


		loginPage.login(uniqueEmail, "E2eTest@1234");
		Assert.assertTrue(loginPage.waitForSuccessfulLoginNavigation(), "Should navigate away from login page.");


		((JavascriptExecutor) driver).executeScript("alert('Welcome to E2E Session!');");
		Assert.assertTrue(AlertUtils.isAlertPresent(driver), "Injected alert should be present.");
		Assert.assertEquals(AlertUtils.getAlertText(driver), "Welcome to E2E Session!", "Alert text should match.");
		AlertUtils.acceptAlert(driver);
		Assert.assertFalse(AlertUtils.isAlertPresent(driver), "Alert should be handled and closed.");
	}
}
