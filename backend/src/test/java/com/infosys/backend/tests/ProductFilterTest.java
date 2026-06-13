package com.infosys.backend.tests;

import com.infosys.backend.base.BaseTest;
import com.infosys.backend.pages.HomePage;
import com.infosys.backend.utilities.AuthUtils;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.List;

public class ProductFilterTest extends BaseTest {

    private HomePage homePage;

    @BeforeMethod
    public void setupAndLogin() {
        String email = AuthUtils.registerNewUser(driver, "filter_user");
        AuthUtils.performLogin(driver, email, "Test@1234");
        
        homePage = new HomePage(driver);
    }

    @Test
    public void shouldFilterByCategory() {
        int initialCount = homePage.getProductCount();
        Assert.assertTrue(initialCount > 0, "No products available to test filtering.");

        // Get the category of the first product to use as filter criteria
        List<String> categories = homePage.getDisplayedProductCategories();
        String categoryToFilter = categories.get(0);

        homePage.selectCategoryFilter(categoryToFilter);

        List<String> displayedCategories = homePage.getDisplayedProductCategories();
        Assert.assertTrue(displayedCategories.size() > 0, "There should be products after filtering by existing category.");
        
        for (String cat : displayedCategories) {
            Assert.assertEquals(cat, categoryToFilter, "Product category should match the selected filter.");
        }
    }

    @Test
    public void shouldFilterByMaxPrice() {
        int initialCount = homePage.getProductCount();
        Assert.assertTrue(initialCount > 0, "No products available to test filtering.");

        double maxPriceToSet = 100.0;
        homePage.enterMaxPriceFilter(String.valueOf(maxPriceToSet));

        List<Double> displayedPrices = homePage.getDisplayedProductPricesAsNumbers();
        
        for (Double price : displayedPrices) {
            Assert.assertTrue(price <= maxPriceToSet, "Product price (" + price + ") should be less than or equal to max price filter (" + maxPriceToSet + ").");
        }
    }

    @Test
    public void shouldFilterByMultipleCriteria() {
        int initialCount = homePage.getProductCount();
        Assert.assertTrue(initialCount > 0, "No products available to test filtering.");

        List<String> categories = homePage.getDisplayedProductCategories();
        String categoryToFilter = categories.get(0);
        double maxPriceToSet = 500.0;

        homePage.selectCategoryFilter(categoryToFilter);
        homePage.enterMaxPriceFilter(String.valueOf(maxPriceToSet));

        List<String> displayedCategories = homePage.getDisplayedProductCategories();
        List<Double> displayedPrices = homePage.getDisplayedProductPricesAsNumbers();

        for (int i = 0; i < displayedCategories.size(); i++) {
            Assert.assertEquals(displayedCategories.get(i), categoryToFilter, "Product category should match the selected filter.");
            Assert.assertTrue(displayedPrices.get(i) <= maxPriceToSet, "Product price should be less than or equal to max price filter.");
        }
    }

    @Test
    public void shouldClearFilters() {
        int initialCount = homePage.getProductCount();
        Assert.assertTrue(initialCount > 0, "No products available to test filtering.");

        List<String> categories = homePage.getDisplayedProductCategories();
        String categoryToFilter = categories.get(0);

        // Apply a filter
        homePage.selectCategoryFilter(categoryToFilter);
        homePage.enterMaxPriceFilter("10");

        // Click clear
        homePage.clickClearFilters();

        int countAfterClear = homePage.getProductCount();
        Assert.assertEquals(countAfterClear, initialCount, "Product count should reset to initial count after clearing filters.");
    }
}
