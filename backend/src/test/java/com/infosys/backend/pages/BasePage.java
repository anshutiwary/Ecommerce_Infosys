package com.infosys.backend.pages;

import org.openqa.selenium.WebDriver;

public abstract class BasePage {

	protected final WebDriver driver;

	protected BasePage(WebDriver driver) {
		this.driver = driver;
	}

	public String getCurrentUrl() {
		return driver.getCurrentUrl();
	}

	public boolean waitForUrlContains(String text) {
		return com.infosys.backend.utilities.WaitUtils.waitForUrlContains(driver, text);
	}
}
