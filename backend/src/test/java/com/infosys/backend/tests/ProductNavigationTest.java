package com.infosys.backend.tests;

import com.infosys.backend.base.BaseTest;
import com.infosys.backend.pages.HomePage;
import com.infosys.backend.pages.ProductDetailPage;
import com.infosys.backend.utilities.AuthUtils;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

public class ProductNavigationTest extends BaseTest {

    private HomePage homePage;
    private ProductDetailPage productDetailPage;

    @BeforeMethod
    public void setupAndLogin() {
        String email = AuthUtils.registerNewUser(driver, "nav_user");
        AuthUtils.performLogin(driver, email, "Test@1234");
        
        homePage = new HomePage(driver);
        productDetailPage = new ProductDetailPage(driver);
    }

    @Test
    public void shouldNavigateToProductDetailPage() {
        int productCount = homePage.getProductCount();
        Assert.assertTrue(productCount > 0, "No products found on listing page.");

        homePage.clickProductDetails(0);
        com.infosys.backend.utilities.WaitUtils.pause(2000);

        boolean isProductRoute = homePage.waitForUrlContains("/product/");
        Assert.assertTrue(isProductRoute, "Should navigate to a /product/ details route.");
    }

    @Test
    public void shouldOpenCorrectProductDetailPage() {
        int productCount = homePage.getProductCount();
        Assert.assertTrue(productCount > 0, "No products found on listing page.");

        String listingName = homePage.getProductTitle(0);
        homePage.clickProductDetails(0);
        com.infosys.backend.utilities.WaitUtils.pause(2000);

        boolean isProductRoute = homePage.waitForUrlContains("/product/");
        Assert.assertTrue(isProductRoute, "Should navigate to a /product/ details route.");

        String detailName = productDetailPage.getProductName();
        Assert.assertEquals(detailName, listingName, "Navigated product detail page should show the correct product name.");
    }

    @Test
    public void shouldLoadProductInformationSuccessfully() {
        int productCount = homePage.getProductCount();
        Assert.assertTrue(productCount > 0, "No products found on listing page.");

        homePage.clickProductDetails(0);
        com.infosys.backend.utilities.WaitUtils.pause(2000);

        boolean isProductRoute = homePage.waitForUrlContains("/product/");
        Assert.assertTrue(isProductRoute, "Should navigate to a /product/ details route.");

        Assert.assertTrue(productDetailPage.isProductTitleDisplayed(), "Product title should be loaded successfully.");
        Assert.assertTrue(productDetailPage.isProductPriceDisplayed(), "Product price should be loaded successfully.");
    }

    @Test
    public void shouldReturnToListingPageOnBackNavigation() {
        int productCount = homePage.getProductCount();
        Assert.assertTrue(productCount > 0, "No products found on listing page.");

        homePage.clickProductDetails(0);
        com.infosys.backend.utilities.WaitUtils.pause(2000);

        boolean isProductRoute = homePage.waitForUrlContains("/product/");
        Assert.assertTrue(isProductRoute, "Should navigate to a /product/ details route.");

        driver.navigate().back();
        com.infosys.backend.utilities.WaitUtils.pause(2000);

        int countAfterBack = homePage.getProductCount();
        Assert.assertTrue(countAfterBack > 0, "Should return to Product Listing page and see products.");
        Assert.assertFalse(driver.getCurrentUrl().contains("/product/"), "URL should no longer contain /product/ after back navigation.");
    }

    @Test
    public void shouldOpenMultipleProductsSuccessfully() {
        int productCount = homePage.getProductCount();
        Assert.assertTrue(productCount > 1, "Need at least two products to test multiple product navigation.");

        String firstListingName = homePage.getProductTitle(0);
        homePage.clickProductDetails(0);
        com.infosys.backend.utilities.WaitUtils.pause(2000);
        Assert.assertTrue(homePage.waitForUrlContains("/product/"), "Should navigate to first product.");
        Assert.assertEquals(productDetailPage.getProductName(), firstListingName, "First product details should match.");

        driver.navigate().back();
        com.infosys.backend.utilities.WaitUtils.pause(2000);
        Assert.assertTrue(homePage.getProductCount() > 0, "Should be back on listing page.");

        String secondListingName = homePage.getProductTitle(1);
        homePage.clickProductDetails(1);
        com.infosys.backend.utilities.WaitUtils.pause(2000);
        Assert.assertTrue(homePage.waitForUrlContains("/product/"), "Should navigate to second product.");
        Assert.assertEquals(productDetailPage.getProductName(), secondListingName, "Second product details should match.");
    }
}
