import { selectorByClassPrefix } from '../utils/selectors';

describe("User Account", () => {
    const selectors = {
        headerContainer: selectorByClassPrefix("style__DesktopMenuContainer"),
        accountInformationTab: selectorByClassPrefix("style__ShopTabFlexContainer"),
        userDetails: selectorByClassPrefix("style__UserDetailsContent"),
        userAddress: selectorByClassPrefix("style__AlertMessage"),
        addNewAddressLink: selectorByClassPrefix("style__NewAddressButton"),
        editAddressLink: selectorByClassPrefix("style__AlertRightContent"),
        saveAddressButton: selectorByClassPrefix("style__ButtonValue")
        
    };

    it("Check User Info", () => {
        cy.server().route({
            method: 'GET',
            url: '**/user',
            status: 200
        }).as('fetchUserInfo')

        cy.server().route({
            method: 'POST',
            url: '**/user/address',
            status: 200
        }).as('saveAddress')

        // Let's login first.
        cy.visit("/login");
        cy.login();

        // Verify if the login is successful.  
        cy.get(selectors.headerContainer).contains("Account")

        // Open up the workspace
        cy.visit("/workspace")

        //click the Account Information
        cy.get(selectors.accountInformationTab).contains("Account Information").click()

        //check user details is visible
        cy.get(selectors.userDetails).should('be.visible') 

        //check if add new address exists
        cy.get(selectors.addNewAddressLink).contains("Add billing address") 
        cy.get(selectors.addNewAddressLink).contains("Add delivery address") 

        //check editing user address
        cy.get(selectors.editAddressLink).contains("Edit").click()

        //saving user address
        cy.get(selectors.saveAddressButton).contains("Save").click()

        //todo: add test for changing password...
    })
});