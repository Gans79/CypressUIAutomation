import { selectorByAttributeValue, selectorByClassPrefix } from '../utils/selectors';

describe("Explore", () => {
    const selectors = {
        headerContainer: selectorByClassPrefix("style__DesktopMenuContainer"),
        exploreContents: selectorByClassPrefix("style__ExplorePageSection"),

    };


    it("Test Explore Contents", () => {
        cy.server();
        cy.route('GET', '**/top?sector*').as('fetchTopDocuments');

        // Let's login first.
        cy.visit("/login");
        cy.login();

        // Verify if the login is successful.  
        cy.get(selectors.headerContainer)
            .contains("Account")
        // Click on Explore  
        cy.get("[data-cy=explore-catalogue-header]").click({ force: true });
        // Let's wait for the page to load.
        cy.wait('@fetchTopDocuments')
        // Assert Explore page 
        cy.get(selectors.exploreContents).eq(0)
            .contains("Popular Standards")
        cy.get(selectors.exploreContents).eq(1)
            .contains("Key Standards by Industry")
        cy.get(selectors.exploreContents).eq(2)
            .contains("ISO International Standards")
        cy.get(selectors.exploreContents).eq(2)
            .contains("IEC International Standards")

    })
});