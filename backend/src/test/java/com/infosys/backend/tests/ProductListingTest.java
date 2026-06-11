package com.infosys.backend.tests;

import com.infosys.backend.base.BaseTest;
import com.infosys.backend.pages.HomePage;
import com.infosys.backend.utilities.AuthUtils;
import com.infosys.backend.utilities.WaitUtils;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.List;

public class ProductListingTest extends BaseTest {

	private HomePage homePage;

	@BeforeMethod
	public void setupAndLogin() {

		String email = AuthUtils.registerNewUser(driver, "listing_user");
		AuthUtils.performLogin(driver, email, "Test@1234");
		
		homePage = new HomePage(driver);
	}

	@Test
	public void shouldDisplayProductsOnListingPage() {
		int productCount = homePage.getProductCount();
		
		Assert.assertTrue(productCount > 0, "Product listing grid should contain at least one product.");
		
		List<String> titles = homePage.getProductTitles();
		Assert.assertEquals(titles.size(), productCount, "Number of titles retrieved should match the product count.");
		
		for (String title : titles) {
			Assert.assertNotNull(title, "Product title should not be null.");
			Assert.assertFalse(title.trim().isEmpty(), "Product title should not be empty.");
		}
	}

	@Test
	public void shouldDisplayProductNames() {
		Assert.assertTrue(homePage.areAllProductNamesVisible(), "All products should have a visible name.");
	}

	@Test
	public void shouldDisplayProductImages() {
		Assert.assertTrue(homePage.areAllProductImagesVisible(), "All products should have a visible image or fallback initial.");
	}

	@Test
	public void shouldDisplayProductPrices() {
		Assert.assertTrue(homePage.areAllProductPricesVisible(), "All products should have a visible price.");
	}

	@Test
	public void shouldDisplayProductDescriptions() {
		Assert.assertTrue(homePage.areAllProductDescriptionsVisible(), "All products should have a visible description.");
	}

	@Test
	public void shouldNavigateToProductDetails() {
		int productCount = homePage.getProductCount();
		Assert.assertTrue(productCount > 0, "Cannot test product details navigation without products.");

		List<String> titles = homePage.getProductTitles();
		String expectedTitle = titles.get(0);


		homePage.clickProductDetails(0);


		boolean isProductRoute = homePage.waitForUrlContains("/product/");
		Assert.assertTrue(isProductRoute, "Should navigate to a /product/ details route.");
	}
}
