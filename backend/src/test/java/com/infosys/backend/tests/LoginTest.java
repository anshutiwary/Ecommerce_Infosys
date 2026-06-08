package com.infosys.backend.tests;

import com.infosys.backend.base.BaseTest;
import com.infosys.backend.pages.LoginPage;
import com.infosys.backend.utilities.TestConfig;
import org.testng.Assert;
import org.testng.annotations.Test;

public class LoginTest extends BaseTest {

	@Test
	public void shouldLoginWithValidCredentials() {
		LoginPage loginPage = new LoginPage(driver);

		Assert.assertNotNull(loginPage, "Login page object should be initialized.");
		Assert.assertNotNull(TestConfig.USER_EMAIL, "Configured login email should not be null.");
		Assert.assertNotNull(TestConfig.USER_PASSWORD, "Configured login password should not be null.");
		loginPage.open();
		loginPage.login(TestConfig.USER_EMAIL, TestConfig.USER_PASSWORD);

		Assert.assertTrue(loginPage.waitForSuccessfulLoginNavigation(), "User should navigate away from login page.");
		Assert.assertFalse(driver.getCurrentUrl().contains("/login"), "Successful login should leave login page.");
		Assert.assertNotNull(driver.getCurrentUrl(), "Current URL should not be null after login.");
	}
}
