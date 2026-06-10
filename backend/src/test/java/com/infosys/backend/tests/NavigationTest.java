package com.infosys.backend.tests;

import com.infosys.backend.base.BaseTest;
import com.infosys.backend.pages.LoginPage;
import com.infosys.backend.pages.RegisterPage;
import com.infosys.backend.utilities.TestConfig;
import org.openqa.selenium.Keys;
import org.testng.Assert;
import org.testng.annotations.Test;


public class NavigationTest extends BaseTest {

	@Test
	public void shouldNavigateFromLoginToRegisterPage() {
		LoginPage loginPage = new LoginPage(driver);
		loginPage.open();

		Assert.assertNotNull(loginPage, "Login page object should be initialized.");
		Assert.assertTrue(loginPage.isLoginPageDisplayed(), "Login page should be displayed.");
		loginPage.clickRegisterLink();

		RegisterPage registerPage = new RegisterPage(driver);
		Assert.assertNotNull(registerPage, "Register page object should be initialized.");
		Assert.assertTrue(registerPage.waitForUrlContains("/register"), "URL should contain /register.");
		Assert.assertEquals(registerPage.getCurrentUrl(), TestConfig.BASE_URL + "register");
		Assert.assertTrue(registerPage.isRegisterPageDisplayed(), "Register page should be displayed.");
		Assert.assertFalse(registerPage.getCurrentUrl().contains("/login"), "User should no longer be on login page.");
	}

	@Test
	public void shouldNavigateFromRegisterToLoginPage() {
		RegisterPage registerPage = new RegisterPage(driver);
		registerPage.open();

		Assert.assertNotNull(registerPage, "Register page object should be initialized.");
		Assert.assertTrue(registerPage.isRegisterPageDisplayed(), "Register page should be displayed.");
		registerPage.clickLoginLink();

		LoginPage loginPage = new LoginPage(driver);
		Assert.assertNotNull(loginPage, "Login page object should be initialized.");
		Assert.assertTrue(loginPage.waitForUrlContains("/login"), "URL should contain /login.");
		Assert.assertEquals(loginPage.getCurrentUrl(), TestConfig.BASE_URL + "login");
		Assert.assertTrue(loginPage.isLoginPageDisplayed(), "Login page should be displayed.");
		Assert.assertFalse(loginPage.getCurrentUrl().contains("/register"), "User should no longer be on register page.");
	}
}
