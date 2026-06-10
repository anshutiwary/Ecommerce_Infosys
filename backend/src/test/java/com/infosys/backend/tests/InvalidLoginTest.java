package com.infosys.backend.tests;

import com.infosys.backend.base.BaseTest;
import com.infosys.backend.pages.LoginPage;
import com.infosys.backend.utilities.TestConfig;
import org.testng.Assert;
import org.testng.annotations.Test;

public class InvalidLoginTest extends BaseTest {

	@Test
	public void shouldAttemptLoginWithInvalidEmail() {
		LoginPage loginPage = new LoginPage(driver);

		loginPage.open();
		loginPage.login("invalid@gmail.com", TestConfig.USER_PASSWORD);
		assertLoginDidNotNavigate(loginPage);
	}

	@Test
	public void shouldAttemptLoginWithInvalidPassword() {
		LoginPage loginPage = new LoginPage(driver);

		loginPage.open();
		loginPage.login(TestConfig.USER_EMAIL, "wrong@1234");
		assertLoginDidNotNavigate(loginPage);
	}

	@Test
	public void shouldAttemptLoginWithBlankCredentials() {
		LoginPage loginPage = new LoginPage(driver);

		loginPage.open();
		loginPage.submitLogin();
		assertLoginDidNotNavigate(loginPage);
	}

	private void assertLoginDidNotNavigate(LoginPage loginPage) {
		Assert.assertNotNull(loginPage, "Login page object should be initialized.");
		Assert.assertTrue(loginPage.isLoginPageDisplayed(), "Login page should remain displayed.");
		Assert.assertTrue(loginPage.getCurrentUrl().contains("/login"), "Invalid login should remain on login page.");
		Assert.assertFalse(loginPage.getCurrentUrl().contains("/dashboard"), "Invalid login should not navigate to dashboard.");
	}
}
