package com.infosys.backend.tests;

import com.infosys.backend.base.BaseTest;
import com.infosys.backend.pages.HomePage;
import com.infosys.backend.pages.ProductDetailPage;
import com.infosys.backend.utilities.AuthUtils;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

public class ProductDetailTest extends BaseTest {

    private HomePage homePage;
    private ProductDetailPage productDetailPage;

    @BeforeMethod
    public void setupAndLogin() {
        String email = AuthUtils.registerNewUser(driver, "detail_user");
        AuthUtils.performLogin(driver, email, "Test@1234");
        
        homePage = new HomePage(driver);
        productDetailPage = new ProductDetailPage(driver);
    }

    @Test
    public void shouldDisplayProductNameOnDetailPage() {
        int productCount = homePage.getProductCount();
        Assert.assertTrue(productCount > 0, "No products found on listing page.");

        homePage.clickProductDetails(0);

        Assert.assertTrue(productDetailPage.isProductTitleDisplayed(), "Product name should be visible on Product Detail page.");
    }

    @Test
    public void shouldDisplayProductPriceOnDetailPage() {
        int productCount = homePage.getProductCount();
        Assert.assertTrue(productCount > 0, "No products found on listing page.");

        homePage.clickProductDetails(0);

        Assert.assertTrue(productDetailPage.isProductPriceDisplayed(), "Product price should be visible on Product Detail page.");
    }

    @Test
    public void shouldMatchProductNameBetweenListingAndDetailPages() {
        int productCount = homePage.getProductCount();
        Assert.assertTrue(productCount > 0, "No products found on listing page.");

        String listingName = homePage.getProductTitle(0);

        homePage.clickProductDetails(0);

        String detailName = productDetailPage.getProductName();

        Assert.assertEquals(detailName, listingName, "Product name on Detail page should match the one on Listing page.");
    }

    @Test
    public void shouldMatchProductPriceBetweenListingAndDetailPages() {
        int productCount = homePage.getProductCount();
        Assert.assertTrue(productCount > 0, "No products found on listing page.");

        String listingPrice = homePage.getProductPrice(0);

        homePage.clickProductDetails(0);

        String detailPrice = productDetailPage.getProductPrice();

        Assert.assertEquals(detailPrice, listingPrice, "Product price on Detail page should match the one on Listing page.");
    }
}
