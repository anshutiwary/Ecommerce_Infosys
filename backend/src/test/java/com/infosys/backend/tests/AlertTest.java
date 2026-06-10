package com.infosys.backend.tests;

import com.infosys.backend.base.BaseTest;
import com.infosys.backend.utilities.TestConfig;
import org.openqa.selenium.JavascriptExecutor;
import org.testng.Assert;
import org.testng.annotations.Test;
import com.infosys.backend.utilities.AlertUtils;
import com.infosys.backend.pages.LoginPage;

public class AlertTest extends BaseTest {

	@Test
	public void shouldAcceptAlert() {
		new LoginPage(driver).open();
		((JavascriptExecutor) driver).executeScript("alert('Test Alert');");
		
		Assert.assertTrue(AlertUtils.isAlertPresent(driver), "Alert should be present.");
		Assert.assertEquals(AlertUtils.getAlertText(driver), "Test Alert");
		
		AlertUtils.acceptAlert(driver);
		Assert.assertFalse(AlertUtils.isAlertPresent(driver), "Alert should be accepted and closed.");
	}

	@Test
	public void shouldDismissAlert() {
		new LoginPage(driver).open();
		((JavascriptExecutor) driver).executeScript("confirm('Test Confirm');");
		
		Assert.assertTrue(AlertUtils.isAlertPresent(driver), "Confirm alert should be present.");
		Assert.assertEquals(AlertUtils.getAlertText(driver), "Test Confirm");
		
		AlertUtils.dismissAlert(driver);
		Assert.assertFalse(AlertUtils.isAlertPresent(driver), "Confirm alert should be dismissed and closed.");
	}

	@Test
	public void shouldHandlePromptAlert() {
		new LoginPage(driver).open();
		((JavascriptExecutor) driver).executeScript("prompt('Test Prompt', 'Default Text');");
		
		Assert.assertTrue(AlertUtils.isAlertPresent(driver), "Prompt alert should be present.");
		Assert.assertEquals(AlertUtils.getAlertText(driver), "Test Prompt");
		
		AlertUtils.acceptPrompt(driver, "New Prompt Text");
		Assert.assertFalse(AlertUtils.isAlertPresent(driver), "Prompt alert should be accepted and closed.");
	}
}
