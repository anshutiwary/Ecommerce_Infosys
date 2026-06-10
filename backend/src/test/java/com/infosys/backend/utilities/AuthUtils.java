package com.infosys.backend.utilities;

import com.infosys.backend.pages.LoginPage;
import com.infosys.backend.pages.RegisterPage;
import org.openqa.selenium.WebDriver;
import org.testng.Assert;

public class AuthUtils {

	/**
	 * Registers a new user to bypass missing DB records in test environment.
	 *
	 * @param driver The WebDriver instance.
	 * @param prefix A prefix for the generated email.
	 * @return The unique email created.
	 */
	public static String registerNewUser(WebDriver driver, String prefix) {
		RegisterPage registerPage = new RegisterPage(driver);
		registerPage.open();
		String uniqueEmail = prefix + "_" + System.currentTimeMillis() + "@example.com";
		registerPage.registerUser("Test User", uniqueEmail, "1234567890", "Test@1234");
		Assert.assertTrue(registerPage.isRegistrationSuccessful(), "Registration should succeed during AuthUtils setup.");
		return uniqueEmail;
	}

	/**
	 * Performs a login with the given credentials and verifies successful navigation.
	 *
	 * @param driver   The WebDriver instance.
	 * @param email    The email to login with.
	 * @param password The password.
	 */
	public static void performLogin(WebDriver driver, String email, String password) {
		LoginPage loginPage = new LoginPage(driver);
		loginPage.open();
		loginPage.login(email, password);
		Assert.assertTrue(loginPage.waitForSuccessfulLoginNavigation(), "User should navigate away from login page during AuthUtils setup.");
	}
}
