package com.infosys.backend.tests;

import com.infosys.backend.base.BaseTest;
import com.infosys.backend.pages.LoginPage;
import com.infosys.backend.utilities.AuthUtils;
import org.testng.Assert;
import org.testng.annotations.Test;

public class LoginTest extends BaseTest {

	@Test
	public void shouldLoginWithValidCredentials() {
		String uniqueEmail = AuthUtils.registerNewUser(driver, "valid_login");

		LoginPage loginPage = new LoginPage(driver);

		Assert.assertNotNull(loginPage, "Login page object should be initialized.");
		loginPage.open();
		loginPage.login(uniqueEmail, "Test@1234");

		Assert.assertTrue(loginPage.waitForSuccessfulLoginNavigation(), "User should navigate away from login page.");
		Assert.assertFalse(loginPage.getCurrentUrl().contains("/login"), "Successful login should leave login page.");
		Assert.assertNotNull(loginPage.getCurrentUrl(), "Current URL should not be null after login.");
	}
}
