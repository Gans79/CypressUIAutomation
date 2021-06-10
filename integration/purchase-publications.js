import { selectorByClassPrefix } from '../utils/selectors';

describe("Purchased Publications", () => {
    const selectors = {
        headerContainer: selectorByClassPrefix("style__DesktopMenuContainer"),
        contentLibraryTab: selectorByClassPrefix("style__ShopTabFlexContainer"),
        publicationDesignation: selectorByClassPrefix("typography__H2"),
        publicationTitle: selectorByClassPrefix("typography__H3"),
        publicationLicence: selectorByClassPrefix("style__DynamicBadgeValue")
    };

    it("Check Purchased Publications", () => {
        cy.server().route({
            method: 'GET',
            url: '**/content/purchased',
            status: 200,
            onResponse: (xhr) => {
                //should see a list of all their publications
                assert.isAbove(xhr.response.body.documents.length, 0, 'There are number of purchases')
            }
        }).as('fetchPublications')

        // Let's login first.
        cy.visit("/login");
        cy.login();

        // Verify if the login is successful.  
        cy.get(selectors.headerContainer).contains("Account")

        // Open up the workspace
        cy.visit("/workspace")

        //click the Content Library
        cy.get(selectors.contentLibraryTab).contains("Content Library")

        //check the columns
        cy.get(selectors.publicationDesignation).contains("ASMaster");
        cy.get(selectors.publicationTitle).contains("AS Master sample");
        cy.get(selectors.publicationLicence).contains("user licence");
    })
});