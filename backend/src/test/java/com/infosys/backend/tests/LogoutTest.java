package com.infosys.backend.tests;

import com.infosys.backend.base.BaseTest;
import com.infosys.backend.pages.HomePage;
import com.infosys.backend.pages.LoginPage;
import com.infosys.backend.utilities.AuthUtils;
import com.infosys.backend.utilities.TestConfig;
import org.testng.Assert;
import org.testng.annotations.Test;

public class LogoutTest extends BaseTest {

	@Test
	public void shouldLogoutSuccessfullyAfterValidLogin() {

		String uniqueEmail = AuthUtils.registerNewUser(driver, "logout_user");
		AuthUtils.performLogin(driver, uniqueEmail, "Test@1234");


		HomePage homePage = new HomePage(driver);
		Assert.assertTrue(homePage.isLogoutButtonDisplayed(), "Logout button should be visible.");
		homePage.clickLogout();


		LoginPage loginPage = new LoginPage(driver);
		Assert.assertTrue(loginPage.isLoginPageDisplayed(), "Application should redirect to Login page after logout.");
		Assert.assertTrue(loginPage.getCurrentUrl().contains("/login"), "URL should contain /login after logout.");
	}
}
