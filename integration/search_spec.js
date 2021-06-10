import { selectorByClassPrefix } from '../utils/selectors';

describe("Search", () => {
    const selectors = {
        filterCheckBox: selectorByClassPrefix("style__CheckboxLabel"),
        widgetItems: selectorByClassPrefix("style__ActiveFilterItem"),
        docTypeName: selectorByClassPrefix("style__DynamicBadgeValue"),
        sortByCheck: selectorByClassPrefix("style__DropdownSelectContainer"),
        designationName: selectorByClassPrefix("style__DesignationContainer"),

    };

    it("Displays the store landing page correctly", () => {
        cy.visit("/");
        cy.contains("Find or buy standards");
    });

    it("Displays no matches from Algolia", () => {
        cy.server(); // Allows us to change behaviour of network requests
        cy.fixture("algolia-search-no-results.json").then((obj) => {
            cy.route("POST", /.*queries.*/, obj);
            cy.visit("/");
            cy.get("[data-cy=quick-search-bar-input]").type("test");
            cy.contains("We couldn’t find any results based on your search “test”.");
            cy.get("[data-cy=icon-search]").click();
            cy.contains("sorry");
        });
    });

    it("Displays matches from Algolia and Navigate to Search Page", () => {
        cy.server(); // Allows us to change behaviour of network requests
        cy.fixture("algolia-search.json").then((obj) => {
            const hit = obj.results[0].hits[0];
            cy.route("POST", /.*queries.*/, obj);
            cy.visit("/");
            //added wait(500) as cypress was too fast at typing and missed first letter
            cy.get("[data-cy=quick-search-bar-input]").type(hit.designation);
            cy.get("[data-cy=search-bar-result-" + hit.objectID + "]");
            cy.get('[value="View more results"]').click();
            cy.url().should("include", `/search?query=${encodeURIComponent(hit.designation)}`);
            cy.contains(hit.designation);
            cy.contains(hit.title);
            cy.contains(hit.synopsis);
            //test filters
            cy.visit("/");
            // Search button is disabled until there is content in search bar
            cy.get("[data-cy=quick-search-bar-input]").type(hit.designation);
            cy.get("[data-cy=icon-search]").click();
            cy.get(selectors.filterCheckBox)
                .contains("Standard").click()
            cy.get(selectors.docTypeName)
                .contains("Standard")
            cy.get(selectors.widgetItems)
                .contains("Standard")
            // Sort by filter 
            cy.get(selectors.sortByCheck).click()
            cy.get(selectors.sortByCheck).contains("Popular").click()
            cy.get(selectors.designationName).first().contains("ISO 1207:2011")
        });
    });

    it("Check Shop Header Links", () => {
        cy.visit("/");

        // Search button is disabled until there is content in search bar
        cy.get("[data-cy=quick-search-bar-input]").type("a");
        cy.get("[data-cy=icon-search]").click();

        //search page
        cy.url().should("include", `/search`);

        //explore catalogue
        cy.get("[data-cy=explore-catalogue-header]").click({ force: true });
        cy.url().should("include", `/explore-catalogue`);

        //buy subscriptions
        cy.get("[data-cy=buy-subscription-header]").click({ force: true });
        cy.url().should("include", `/buy-subscription`);

        //standards value
        cy.get("[data-cy=standards-value-header]").click({ force: true });
        cy.url().should("include", `/standards-value`);

        //cart
        cy.get("[data-cy=cart-header]").click();
        cy.url().should("include", `/cart`);

        //home
        cy.get("[data-cy=store-logo-neg]").click();
        cy.url().should("include", `/`);
    });

    it("Check Shop Footer Links", () => {
        cy.visit("/");

        cy.get("[data-cy=app-container]").scrollTo('bottom').get("[data-cy=privacy_policy]").click();
        cy.url().should("include", `/privacy-policy`);

        cy.get("[data-cy=app-container]").scrollTo('bottom').get("[data-cy=terms_and_conditions]").click();
        cy.url().should("include", `/terms-and-conditions`);

        cy.get("[data-cy=app-container]").scrollTo('bottom').get("[data-cy=accessibility]").click();
        cy.url().should("include", `/accessibility`);

        cy.get("[data-cy=app-container]").scrollTo('bottom').get("[data-cy=site_map]").click();
        cy.url().should("include", `/site-map`);

        // Check clicking on logo
        cy.get("[data-cy=app-container]").scrollTo('bottom').get("[data-cy=logo-white]").first().click();
        cy.url().should("include", `/`);
    });

});