import { selectorById, selectorByClassPrefix } from '../utils/selectors';

describe("Product", () => {
    const selectors = {
        headerContainer: selectorByClassPrefix("style__DesktopMenuContainer"),
        designationTitle: selectorByClassPrefix("style__DesignationContainer"),
        eReaderButton: selectorByClassPrefix("style__ButtonContainer-sc"),
        publishedDate: selectorByClassPrefix("style__PublishedContainer-sc"),
        sectionLoginCart: selectorByClassPrefix("style__DesktopMenuLoginAndCartSection"),
        menuAccount: selectorByClassPrefix("style__MenuDropDownContainer"),
        logoutButton: selectorByClassPrefix("style__ModalButton-sc"),
        contentHistorySection: selectorById("productData-tab-item-2")
    };

    it("Loads Product Page for ASMaster", () => {
        // Let's login first.
        cy.visit("/login");
        cy.login();

        // Verify if the login is successful.  
        cy.get(selectors.headerContainer)
            .contains("Account")

        // Specify which API's will be called and set as objects.
        // Without setting up an API route cypress won't wait for the API's
        // Note: These are calling the internal API's and are NOT mocked
        cy.server().route('GET', '**/productDetails?designationId=ASMaster').as('fetchProduct')

        // Open up the master document
        cy.visit("/product?designationId=ASMaster")

        // Wait for the API's defined above
        cy.wait(['@fetchProduct'])

        // Ensure Product Page is displayed with assertions 
        cy.get(selectors.designationTitle)
            .contains("ASMaster")
        cy.get(selectors.eReaderButton)
            .contains("Open")
        cy.get(selectors.publishedDate)
            .contains("26/06/2018")

        // Ensures content history section is visible.
        cy.get(selectors.contentHistorySection)
            .contains("Content history")

        // Ensures that at least one of the edition is visible.
        cy.get(selectors.contentHistorySection)
            .contains("ASMaster Edition1")

        // Initiate Logout process
        cy.get(selectors.sectionLoginCart)
            .contains("Account").click()
        // Make sure focus is on the account menu, otherwise
        // the dropdown with the logout option are not shown
        cy.get(selectors.menuAccount)
            .contains("Log out").click({ force: true })
        cy.get(selectors.logoutButton)
            .contains("Logout").click()
        // Check Logout sucessfully   
        cy.get(selectors.headerContainer)
            .contains("Login")
    })
});