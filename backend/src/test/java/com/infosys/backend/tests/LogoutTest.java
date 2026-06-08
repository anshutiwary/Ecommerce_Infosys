package com.infosys.backend.tests;

import com.infosys.backend.base.BaseTest;
import com.infosys.backend.pages.HomePage;
import com.infosys.backend.pages.LoginPage;
import com.infosys.backend.pages.RegisterPage;
import com.infosys.backend.utilities.TestConfig;
import org.testng.Assert;
import org.testng.annotations.Test;

public class LogoutTest extends BaseTest {

	@Test
	public void shouldLogoutSuccessfullyAfterValidLogin() {

		driver.get(TestConfig.BASE_URL + "register");
		RegisterPage registerPage = new RegisterPage(driver);
		String uniqueEmail = "logout_user_" + System.currentTimeMillis() + "@example.com";
		registerPage.registerUser("Logout Tester", uniqueEmail, "1234567890", "Test@1234");
		Assert.assertTrue(registerPage.isRegistrationSuccessful(), "Registration should succeed for logout test.");


		driver.get(TestConfig.BASE_URL + "login");
		LoginPage loginPage = new LoginPage(driver);
		loginPage.login(uniqueEmail, "Test@1234");


		Assert.assertTrue(loginPage.waitForSuccessfulLoginNavigation(), "User should navigate away from login page.");


		HomePage homePage = new HomePage(driver);
		Assert.assertTrue(homePage.isLogoutButtonDisplayed(), "Logout button should be visible.");
		homePage.clickLogout();


		Assert.assertTrue(loginPage.isLoginPageDisplayed(), "Application should redirect to Login page after logout.");
		Assert.assertTrue(driver.getCurrentUrl().contains("/login"), "URL should contain /login after logout.");
	}
}
