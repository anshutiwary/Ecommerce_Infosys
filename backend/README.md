# EcommerceInfosysAutomation

## Project Overview

EcommerceInfosysAutomation is a Selenium, TestNG, and Maven based automation testing framework added to the existing Spring Boot backend project. The framework is designed to validate ecommerce user journeys while preserving the backend application behavior.

## Sauce Demo Selenium TestNG Framework

This project includes a reference implementation style inspired by common Sauce Demo Selenium TestNG frameworks:

- Selenium WebDriver for browser automation.
- TestNG for test lifecycle and assertions.
- WebDriverManager for local driver management.
- Page Object Model for reusable page-level behavior.
- Runtime configuration through JVM system properties or environment variables.

## EcommerceInfosysAutomation Framework

The framework provides a clean automation layer under `src/test/java/com/infosys/backend`. It keeps browser setup, page interactions, configuration, and test flows separated so the suite can grow without changing application code.

## Tech Stack

- Java 17
- Maven
- Spring Boot
- Selenium Java
- TestNG
- WebDriverManager
- Chrome browser

## Project Architecture

The automation framework follows a layered test architecture:

- `base`: Browser setup and cleanup.
- `pages`: Page Object Model classes.
- `tests`: End-to-end test scenarios.
- `utils`: Shared configuration and future utility support.

## Folder Structure

```text
src/test/java/com/infosys/backend
├── BackendApplicationTests.java
├── base
│   └── BaseTest.java
├── pages
│   ├── CartPage.java
│   ├── CheckoutPage.java
│   ├── LoginPage.java
│   └── ProductPage.java
├── tests
│   └── SingleSessionFlowTest.java
└── utils
    └── TestConfig.java
```

## Design Pattern Used

Page Object Model is used to keep locators and browser actions inside page classes. Test classes call page methods to describe user flows without duplicating Selenium interaction code.

## Prerequisites

- Java 17 installed.
- Maven installed, or use the included Maven wrapper.
- Google Chrome installed.
- Application running locally or in a reachable test environment.

## Maven Setup

Automation dependencies are configured in `pom.xml` with test scope:

- `selenium-java`
- `testng`
- `webdrivermanager`

## Selenium Setup

`BaseTest` initializes Chrome through WebDriverManager before each TestNG method. The browser is maximized and closed after each test method.

## TestNG Setup

Test classes use TestNG annotations:

- `@BeforeMethod` for setup.
- `@AfterMethod` for cleanup.
- `@Test` for executable test scenarios.

## Execution Steps

Start the ecommerce application, then run the automation test with configuration values:

```bash
./mvnw test \
  -Dapp.url=http://localhost:8080 \
  -Dapp.username=standard_user \
  -Dapp.password=secret_sauce
```

## Run From VS Code

1. Open the project folder in VS Code.
2. Install Java and Maven extensions if needed.
3. Start the Spring Boot application.
4. Open `SingleSessionFlowTest.java`.
5. Run the TestNG test from the editor or Maven panel.

## Run From Terminal

```bash
./mvnw test
```

Runtime values can be overridden:

```bash
./mvnw test -Dapp.url=http://localhost:8080 -Dapp.username=my-user -Dapp.password=my-password
```

## Class Explanation

- `BaseTest`: Creates and cleans up Chrome WebDriver sessions.
- `TestConfig`: Reads application URLs, credentials, paths, and locators from system properties or environment variables.
- `LoginPage`: Handles login and logout interactions.
- `ProductPage`: Handles product listing navigation and add-to-cart action.
- `CartPage`: Handles cart checkout navigation.
- `CheckoutPage`: Handles checkout completion and confirmation checks.
- `SingleSessionFlowTest`: Demonstrates a complete ecommerce flow in one browser session.

## Automated Flows

- Launch application.
- Login.
- Navigate to products.
- Add a product to cart.
- Proceed to checkout.
- Place order.
- Verify confirmation.
- Logout.

## Test Documentation

Default runtime keys:

| Key | Environment Variable | Default |
| --- | --- | --- |
| `app.url` | `APP_URL` | `http://localhost:8080` |
| `app.username` | `APP_USERNAME` | `standard_user` |
| `app.password` | `APP_PASSWORD` | `secret_sauce` |
| `app.login.path` | `APP_LOGIN_PATH` | `/login` |
| `app.products.path` | `APP_PRODUCTS_PATH` | `/products` |
| `app.checkout.path` | `APP_CHECKOUT_PATH` | `/checkout` |

Locator keys can also be supplied through system properties or environment variables. Examples include `locator.login.username`, `locator.product.add.first`, and `locator.checkout.confirmation`.

## End-to-End Flow

`SingleSessionFlowTest` demonstrates the full journey from login through checkout and logout. Locators are placeholders and should be mapped to the final frontend attributes for the target ecommerce application.

## Future Enhancements

- Add explicit waits for dynamic pages.
- Add TestNG XML suite files.
- Add screenshot capture on failure.
- Add reporting with ExtentReports or Allure.
- Add cross-browser execution.
- Add CI pipeline execution.
- Add data-driven tests.

