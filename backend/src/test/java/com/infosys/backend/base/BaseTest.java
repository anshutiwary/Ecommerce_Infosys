package com.infosys.backend.base;

import com.infosys.backend.utilities.DriverFactory;
import org.openqa.selenium.WebDriver;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import com.infosys.backend.utilities.WaitUtils;

public abstract class BaseTest {

	protected WebDriver driver;

	@BeforeMethod(alwaysRun = true)
	public void setUp() {
		driver = DriverFactory.createChromeDriver();
		WaitUtils.applyImplicitWait(driver);
		driver.manage().window().maximize();
	}

	@AfterMethod(alwaysRun = true)
	public void tearDown() {
		if (driver != null) {
			WaitUtils.waitBeforeClosingBrowser();
			driver.quit();
			driver = null;
		}
	}
}
