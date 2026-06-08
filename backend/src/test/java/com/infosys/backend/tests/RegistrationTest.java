package com.infosys.backend.tests;

import com.infosys.backend.base.BaseTest;
import com.infosys.backend.pages.RegisterPage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class RegistrationTest extends BaseTest {

	@Test
	public void shouldRegisterNewUser() {
		RegisterPage registerPage = new RegisterPage(driver);
		String uniqueEmail = "abhishek" + System.currentTimeMillis() + "@gmail.com";

		Assert.assertNotNull(registerPage, "Register page object should be initialized.");
		Assert.assertNotNull(uniqueEmail, "Generated email should not be null.");
		registerPage.open();
		registerPage.registerUser("Abhishek", uniqueEmail, "9876543210", "Abhi@1234");

		Assert.assertTrue(registerPage.isRegistrationSuccessful(), "Registration success message should be displayed.");
		Assert.assertEquals(registerPage.getRegistrationStatusMessage(), "Registration successful.");
		Assert.assertFalse(registerPage.getRegistrationStatusMessage().isBlank(), "Status message should not be blank.");
	}
}
