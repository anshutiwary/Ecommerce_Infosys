package com.infosys.backend.tests;

import com.infosys.backend.base.BaseTest;
import com.infosys.backend.pages.HomePage;
import com.infosys.backend.utilities.AuthUtils;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.List;

public class ProductSearchTest extends BaseTest {

    private HomePage homePage;

    @BeforeMethod
    public void setupAndLogin() {
        String email = AuthUtils.registerNewUser(driver, "search_user");
        AuthUtils.performLogin(driver, email, "Test@1234");
        
        homePage = new HomePage(driver);
    }

    @Test
    public void shouldSearchForValidProductAndOpenIt() {
        int initialCount = homePage.getProductCount();
        Assert.assertTrue(initialCount > 0, "No products available to test search.");

        String productName = homePage.getProductTitle(0);
        
        homePage.enterSearchText(productName);
        
        List<String> currentTitles = homePage.getProductTitles();
        Assert.assertTrue(currentTitles.size() > 0, "Search results should not be empty for an exact match.");
        for (String title : currentTitles) {
            Assert.assertTrue(title.toLowerCase().contains(productName.toLowerCase()), 
                "Search result '" + title + "' should contain the search term '" + productName + "'.");
        }

        homePage.clickProductDetails(0);
        com.infosys.backend.utilities.WaitUtils.pause(2000);

        boolean isProductRoute = homePage.waitForUrlContains("/product/");
        Assert.assertTrue(isProductRoute, "Should navigate to a /product/ details route after searching.");

        com.infosys.backend.pages.ProductDetailPage productDetailPage = new com.infosys.backend.pages.ProductDetailPage(driver);
        Assert.assertEquals(productDetailPage.getProductName(), productName, "Opened product should match the searched product.");
    }

    @Test
    public void shouldSearchWithPartialProductName() {
        int initialCount = homePage.getProductCount();
        Assert.assertTrue(initialCount > 0, "No products available to test search.");

        String productName = homePage.getProductTitle(0);
        // Use half of the product name as partial search term
        String partialName = productName.substring(0, productName.length() / 2);
        
        homePage.enterSearchText(partialName);
        
        List<String> currentTitles = homePage.getProductTitles();
        Assert.assertTrue(currentTitles.size() > 0, "Search results should not be empty for a partial match.");
        for (String title : currentTitles) {
            Assert.assertTrue(title.toLowerCase().contains(partialName.toLowerCase()), 
                "Search result '" + title + "' should contain the partial search term '" + partialName + "'.");
        }
    }



    @Test
    public void shouldShowAllProductsOnEmptySearch() {
        int initialCount = homePage.getProductCount();
        Assert.assertTrue(initialCount > 0, "No products available to test search.");

        // First enter some text to filter
        homePage.enterSearchText("nonexistent_product_123");
        Assert.assertEquals(homePage.getProductCount(), 0, "Products should be filtered out.");

        // Now clear search
        homePage.clearSearch();
        
        int currentCount = homePage.getProductCount();
        Assert.assertEquals(currentCount, initialCount, "All products should be displayed when search is empty.");
    }

    @Test
    public void shouldShowNoResultsMessageForNonexistentProduct() {
        homePage.enterSearchText("this_product_does_not_exist_xyz123");
        
        int count = homePage.getProductCount();
        Assert.assertEquals(count, 0, "No products should be found.");
        
        String noResultsMessage = homePage.getNoResultsMessage();
        Assert.assertEquals(noResultsMessage, "No products match your search and filters.", "Should display the correct no results message.");
    }
}
