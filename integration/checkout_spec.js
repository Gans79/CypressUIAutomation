import {
    selectorByAttributeValue,
    selectorByClassPrefix,
    selectorById
} from '../utils/selectors';

describe("Checkout", () => {
    const selectors = {
        headerContainer: selectorByClassPrefix("style__DesktopMenuContainer"),
        designationTitle: selectorByClassPrefix("style__DesignationContainer"),
        buttonContainer: selectorByClassPrefix("style__ButtonContainer"),
        checkboxContainer: selectorByClassPrefix("style__CheckboxContainer"),
        // Some of the checkbox contain links, to avoid clicking on links, click
        // directly on the square
        checkboxIndicator: selectorByClassPrefix("style__CheckboxIndicator"),
        publishedDate: selectorByClassPrefix("style__PublishedContainer-sc"),
        sectionLoginCart: selectorByClassPrefix("style__DesktopMenuLoginAndCartSection"),
        menuAccount: selectorByClassPrefix("style__MenuDropDownContainer"),
        logoutButton: selectorByClassPrefix("style__ModalButton-sc"),
        cartSummarySection: selectorByClassPrefix("style__CartPaymentSummaryContainer"),
        cartItemContainer: selectorByClassPrefix("style__CartItemContainer"),
        cartLicenseRemove: selectorByClassPrefix("style__CartProductLicenseAndRemove"),
        cartRemove: selectorByClassPrefix("style__CartRemoveButton"),
        dropdownSelection: selectorByClassPrefix("style__DropdownSelectContainer"),
        dropdownSelectionId: selectorById("publication-format-select"),
        modalButtonSection: selectorByClassPrefix("style__ModalButtonSection"),
        firstName: selectorByAttributeValue("name", "firstName"),
        lastName: selectorByAttributeValue("name", "lastName"),
        password: selectorByAttributeValue("name", "password"),
        password2: selectorByAttributeValue("name", "password2"),
        companyName: selectorByAttributeValue("name", "companyName"),
        addressLine1: selectorByAttributeValue("name", "line1"),
        addressLine2: selectorByAttributeValue("name", "line2"),
        addressSuburb: selectorByAttributeValue("name", "suburb"),
        addressPostcode: selectorByAttributeValue("name", "postCode"),
        telephone: selectorByAttributeValue("type", "tel"),
        email: selectorByAttributeValue("name", "email"),
        paymentPageName: selectorByAttributeValue("name", "EWAY_CARDNAME"),
        paymentPageCardNo: selectorByAttributeValue("name", "EWAY_CARDNUMBER"),
        paymentPageCardCvn: selectorByAttributeValue("name", "EWAY_CARDCVN"),
        purchaseConfirmation: selectorByClassPrefix("style__ConfirmationHeader"),
        accountLoginCreateUserPrompt: selectorByClassPrefix("style__ModalInfoButtonSection"),
        quantitySelect: selectorById("quantity-format-select"),
        formatSelect: selectorById("publication-format-select"),
        accountCreatedConfirmBtn: selectorByAttributeValue("data-cy", "account-created-btn"),
    };

    const clearCart = () => {
        // Open up the cart
        cy.visit("/cart");

        cy.get('[role="button"]').first().then(($btn) => {
            if ($btn[0].textContent !== 'Continue Shopping') {
                // cart is not empty - clear it
                cy.get(selectors.buttonContainer)
                    .contains("Clear Cart").as('clearCartBtn');
                cy.get('@clearCartBtn').click();
                cy.wait(['@clearFromCart'])
            }
        });
    }

    const addProductAndMoveToCart = () => {
        // Specify which API's will be called and set as objects.
        // Without setting up an API route cypress won't wait for the API's
        // Note: These are calling the internal API's and are NOT mocked
        cy.server().route('GET', '**/productDetails?designationId=ASMaster').as('fetchProduct')
        cy.server().route('POST', '**/createCart').as('createCart')
        cy.server().route('POST', '**/addToCart').as('addToCart')

        // Open up the master document
        cy.visit("/product?designationId=ASMaster")

        // Wait for the API's defined above
        cy.wait(['@fetchProduct'])

        // Ensure Product Page is displayed with assertions  
        cy.get(selectors.designationTitle)
            .contains("ASMaster")
        cy.get(selectors.buttonContainer)
            .contains("Open")
        cy.get(selectors.publishedDate)
            .contains("26/06/2018")

        // Try adding the same item that exists in order history - message should be displayed
        // eReader already exists in order history for test user
        cy.get(selectors.formatSelect)
            .click()
        cy.get(selectors.dropdownSelection)
            .contains("eReader")
            .click({ force: true })
        cy.get(selectors.buttonContainer)
            .contains("Add to cart").click()

        cy.wait(['@createCart']) //will return 403
        // Close alert
        cy.get(selectors.modalButtonSection)
            .contains("Add to cart").click()

        cy.wait(['@createCart']) // will return 201
        cy.get(selectors.buttonContainer)
            .contains("Continue Shopping").click()

        // Add a second item
        cy.get(selectors.formatSelect)
            .click()
        cy.get(selectors.dropdownSelection)
            .contains("Hardcopy")
            .click()
        cy.get(selectors.quantitySelect)
            .click()

        cy.get(selectors.dropdownSelection)
            .contains("4")
            .click()

        cy.get(selectors.buttonContainer)
            .contains("Add to cart").click()

        // Wait for the API's defined above   
        cy.wait(['@addToCart'])

        cy.get(selectors.buttonContainer)
            .contains("View Cart").click()
        cy.location('pathname').should('eq', '/cart')

        cy.get(selectors.cartItemContainer)
            .contains("Hardcopy")
            .parent()
            .find(selectors.cartLicenseRemove)
            .contains("Remove")
            .click();
    };

    const addProductAndMoveToCartSimplified = () => {
        // Specify which API's will be called and set as objects.
        // Without setting up an API route cypress won't wait for the API's
        // Note: These are calling the internal API's and are NOT mocked
        cy.server().route('GET', '**/productDetails?designationId=ASMaster').as('fetchProduct')
        cy.server().route('POST', '**/createCart').as('createCart')
        cy.server().route('POST', '**/addToCart').as('addToCart')

        // Open up the master document
        cy.visit("/product?designationId=ASMaster")

        // Wait for the API's defined above
        cy.wait(['@fetchProduct'])

        // Ensure Product Page is displayed with assertions  
        cy.get(selectors.designationTitle)
            .contains("ASMaster")
        cy.get(selectors.buttonContainer)
            .contains("Preview")
        cy.get(selectors.publishedDate)
            .contains("26/06/2018")

        // Add first item   
        cy.get(selectors.formatSelect)
            .click()
        cy.get(selectors.dropdownSelection)
            .contains("eReader")
            .click({ force: true })
        cy.get(selectors.quantitySelect)
            .click()

        cy.get(selectors.dropdownSelection)
            .contains("2 users")
            .click()

        cy.get(selectors.buttonContainer)
            .contains("Add to cart").click()

        cy.wait(['@createCart'])

        cy.get(selectors.buttonContainer)
            .contains("View Cart").click()
        cy.location('pathname').should('eq', '/cart')
    };


    const checkoutCart = (enterBillingInfo) => {
        // Billing Information Page
        cy.location('pathname').should('eq', '/checkout/billing-delivery')

        // If disabled enter billing info
        if (enterBillingInfo) {
            cy.get(selectors.firstName)
                .type("Automation")
            cy.get(selectors.lastName)
                .type("User")
            cy.get(selectors.companyName)
                .type("Shop")
            cy.get(selectors.addressLine1)
                .type("36 Cowper St")
            cy.get(selectors.addressSuburb)
                .type("Parramatta")
            cy.get(selectors.addressPostcode)
                .type("2000")
            cy.get(selectors.telephone)
                .type("435099344")
        }

        // Continue to next page
        cy.get(selectors.buttonContainer)
            .contains("Continue to Review Order").click({ force: true });

        // Let's mock the API's
        cy.server();
        cy.fixture("cart/customer-access-code.json").then((obj) => {
            cy.route("POST", '**/getCustomerAccessCode', obj);
        });

        cy.location('pathname').should('eq', '/checkout/review')

        cy.get(selectors.checkboxContainer)
            .contains("I accept the").click()


        cy.get(selectors.buttonContainer)
            .contains("Continue to Payment Details").click({ force: true })

        // Let's mock API's which we need to complete the payment.
        cy.server();
        cy.fixture("cart/payment-result.json").then((obj) => {
            cy.route("GET", '**/payment/result?accessCode**', obj);
        });
        cy.server({
            status: 200
        });
        cy.route("POST", '**/completeOrder', {});
        cy.fixture("cart/confirmation-response.json").then((obj) => {
            cy.route("GET", '**/confirmation?cartCode**', obj);
        });

        // Let's fill up the payment details.
        cy.get(selectors.paymentPageName)
            .type("Test")
        cy.get(selectors.paymentPageCardNo)
            .type("4444333322221111")
        cy.get(selectors.paymentPageCardCvn)
            .type("123")

        // Place over - The formActionURL from the mock response 
        // should redirect user back to http://.../checkout/pay?AccessCode=CypressShopTest
        cy.get(selectors.buttonContainer)
            .contains("Place Order").click({ force: true })

        cy.get(selectors.purchaseConfirmation)
            .contains("Thank you for your purchase")
    }

    it("Existing User (Logged In) - Loads Product Page for ASMaster and checkout", () => {
        // Let's login first.
        cy.visit("/login");
        cy.login();

        // Verify if the login is successful.  
        cy.get(selectors.headerContainer)
            .contains("Account")

        // Added product AS Master to cart
        addProductAndMoveToCart();

        // Proceed to Checkout
        cy.get(selectors.cartSummarySection)
            .contains("Proceed to Checkout").click()

        // As user is logged in no login prompt 

        // Checkout cart
        checkoutCart(true);
    })

    // Test case not needed at the moment, placeholder below
    // it("Existing User (Logged Out) - Loads Product Page for ASMaster and checkout", () => {
    //     // Don't log in

    //     // Added product AS Master to cart
    //     addProductAndMoveToCart();

    //     // Proceed to Checkout
    //     cy.get(selectors.cartSummarySection)
    //         .contains("Proceed to Checkout").click()

    //     // As user is NOT logged in, login prompt is shown
    //     cy.get(selectors.accountLoginCreateUserPrompt)
    //         .contains("Account login").click()

    //     // Log in with test uer
    //     cy.login("/cart", true);

    //     // As user is now logged in no login prompt 

    //     // Proceed to Checkout
    //     cy.get(selectors.cartSummarySection)
    //         .contains("Proceed to Checkout").click()

    //     // Checkout cart
    //     checkoutCart();
    // })


    it("New User (Create User) - Loads Product Page for ASMaster and checkout", () => {
        // Don't log in

        // Added product AS Master to cart
        addProductAndMoveToCartSimplified();

        // Proceed to Checkout
        cy.get(selectors.cartSummarySection)
            .contains("Proceed to Checkout").click()

        // As user is NOT logged in, login prompt is shown
        cy.get(selectors.accountLoginCreateUserPrompt)
            .contains("Create an account").click()

        // Enter new user details
        cy.get(selectors.email)
            .type("guest@automation.com")
        cy.get(selectors.firstName)
            .type("Guest")
        cy.get(selectors.lastName)
            .type("User")
        cy.get(selectors.dropdownSelection)
            .eq(1) // 2nd dropdown is job role
            .click()
            .contains("Accountant")
            .click()
        cy.get(selectors.dropdownSelection)
            .eq(2) // 3rd dropdown is sector
            .click()
            .contains("Communications, Information Technology and e-Commerce Services")
            .click()
        cy.get(selectors.password)
            .type("Shop1234")
        cy.get(selectors.password2)
            .type("Shop1234")

        // Click on terms agreement, contains links, so make sure
        // to click on the checkbox square, not the text
        cy.get(selectors.checkboxIndicator).first().click()

        // Let's mock API's which we need to complete the creation of a user.
        cy.server();
        // first get create user token
        cy.fixture("user/create-user-token-response.json").then((obj) => {
            cy.route("GET", '**/user/token', obj);
        });
        cy.server({
            status: 201
        });
        // second create user in Azure
        cy.fixture("user/create-azure-user-response.json").then((obj) => {
            cy.route("POST", '**.onmicrosoft.com/users?api-version=1.6', obj);
        });

        // Create new user
        cy.get(selectors.buttonContainer)
            .contains("Create Account")
            .click({ force: true })

        // Success message shows - click OK to redirect to checkout
        cy.get(selectors.accountCreatedConfirmBtn)
            .contains("OK")
            .click({ force: true })

        // Checkout cart
        checkoutCart(true);
    })
});