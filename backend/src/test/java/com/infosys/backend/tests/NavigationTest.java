package com.infosys.backend.tests;

import com.infosys.backend.base.BaseTest;
import com.infosys.backend.pages.LoginPage;
import com.infosys.backend.pages.RegisterPage;
import com.infosys.backend.utilities.TestConfig;
import org.openqa.selenium.Keys;
import org.testng.Assert;
import org.testng.annotations.Test;
import com.infosys.backend.utilities.WaitUtils;

public class NavigationTest extends BaseTest {

	@Test
	public void shouldNavigateFromLoginToRegisterPage() {
		driver.get(TestConfig.BASE_URL + "login");

		LoginPage loginPage = new LoginPage(driver);
		Assert.assertNotNull(loginPage, "Login page object should be initialized.");
		Assert.assertNotNull(WaitUtils.waitForElementVisible(driver, loginPage.loginHeading()));
		WaitUtils.waitForElementClickable(driver, loginPage.registerLink()).click();

		RegisterPage registerPage = new RegisterPage(driver);
		Assert.assertNotNull(registerPage, "Register page object should be initialized.");
		Assert.assertTrue(WaitUtils.waitForUrlContains(driver, "/register"), "URL should contain /register.");
		Assert.assertEquals(driver.getCurrentUrl(), TestConfig.BASE_URL + "register");
		Assert.assertTrue(WaitUtils.waitForElementVisible(driver, registerPage.registerHeading()).isDisplayed());
		Assert.assertFalse(driver.getCurrentUrl().contains("/login"), "User should no longer be on login page.");
	}

	@Test
	public void shouldNavigateFromRegisterToLoginPage() {
		driver.get(TestConfig.BASE_URL + "register");

		RegisterPage registerPage = new RegisterPage(driver);
		Assert.assertNotNull(registerPage, "Register page object should be initialized.");
		Assert.assertNotNull(WaitUtils.waitForElementVisible(driver, registerPage.registerHeading()));
		WaitUtils.waitForElementVisible(driver, registerPage.loginLink()).sendKeys(Keys.ENTER);

		LoginPage loginPage = new LoginPage(driver);
		Assert.assertNotNull(loginPage, "Login page object should be initialized.");
		Assert.assertTrue(WaitUtils.waitForUrlContains(driver, "/login"), "URL should contain /login.");
		Assert.assertEquals(driver.getCurrentUrl(), TestConfig.BASE_URL + "login");
		Assert.assertTrue(WaitUtils.waitForElementVisible(driver, loginPage.loginHeading()).isDisplayed());
		Assert.assertFalse(driver.getCurrentUrl().contains("/register"), "User should no longer be on register page.");
	}
}
