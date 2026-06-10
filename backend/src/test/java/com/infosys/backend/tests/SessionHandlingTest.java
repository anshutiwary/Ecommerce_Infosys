package com.infosys.backend.tests;

import com.infosys.backend.base.BaseTest;
import com.infosys.backend.pages.HomePage;
import com.infosys.backend.pages.LoginPage;
import com.infosys.backend.utilities.AuthUtils;
import com.infosys.backend.utilities.TestConfig;
import org.openqa.selenium.JavascriptExecutor;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

public class SessionHandlingTest extends BaseTest {

	private String uniqueEmail;

	@BeforeMethod
	public void setupUser() {
		uniqueEmail = AuthUtils.registerNewUser(driver, "session_user");
	}

	private void performLogin() {
		AuthUtils.performLogin(driver, uniqueEmail, "Test@1234");
	}

	private String getSessionToken() {
		JavascriptExecutor js = (JavascriptExecutor) driver;
		return (String) js.executeScript("return window.sessionStorage.getItem('ecom_app_access_token');");
	}

	private void clearSessionToken() {
		JavascriptExecutor js = (JavascriptExecutor) driver;
		js.executeScript("window.sessionStorage.removeItem('ecom_app_access_token');");
	}

	@Test
	public void shouldCreateSessionTokenAfterLogin() {
		performLogin();
		String token = getSessionToken();
		Assert.assertNotNull(token, "Session token should be present in sessionStorage after login.");
		Assert.assertFalse(token.trim().isEmpty(), "Session token should not be empty.");
	}

	@Test
	public void shouldInvalidateSessionTokenAfterLogout() {
		performLogin();
		
		HomePage homePage = new HomePage(driver);
		homePage.clickLogout();

		LoginPage loginPage = new LoginPage(driver);
		Assert.assertTrue(loginPage.isLoginPageDisplayed(), "Should redirect to login after logout.");

		String token = getSessionToken();
		Assert.assertNull(token, "Session token should be removed from sessionStorage after logout.");
	}

	@Test
	public void shouldNotAccessProtectedPagesAfterLogout() {
		performLogin();
		
		HomePage homePage = new HomePage(driver);
		homePage.clickLogout();


		driver.get(TestConfig.BASE_URL + "profile");
		
		LoginPage loginPage = new LoginPage(driver);
		Assert.assertTrue(loginPage.isLoginPageDisplayed(), "Application should redirect to Login page when accessing protected route.");
		Assert.assertTrue(loginPage.getCurrentUrl().contains("/login"), "URL should be redirected to /login.");
	}

	@Test
	public void shouldNotRestoreProtectedPageUsingBackButtonAfterLogout() {
		performLogin();
		

		driver.get(TestConfig.BASE_URL + "profile");
		
		HomePage homePage = new HomePage(driver);
		homePage.clickLogout();

		LoginPage loginPage = new LoginPage(driver);
		Assert.assertTrue(loginPage.isLoginPageDisplayed(), "Should be on login page after logout.");


		driver.navigate().back();


		Assert.assertTrue(loginPage.isLoginPageDisplayed(), "Browser back button should not bypass authentication.");
	}

	@Test
	public void shouldRedirectWhenSessionIsInvalidatedManually() {
		performLogin();
		

		clearSessionToken();


		driver.get(TestConfig.BASE_URL + "profile");

		LoginPage loginPage = new LoginPage(driver);
		Assert.assertTrue(loginPage.isLoginPageDisplayed(), "Application should redirect to Login page when session token is missing.");
	}
}
