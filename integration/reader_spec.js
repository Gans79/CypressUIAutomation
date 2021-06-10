import {
    selectorByAttributeValue,
    selectorByClassPrefix,
    selectorById
} from '../utils/selectors';

describe("Reader", () => {
    const selectors = {
        tocToggle: selectorByAttributeValue("data-cy", "icon-toc"),
        tocContainer: selectorByClassPrefix("style__SideMenuPanelContainer"),
        tocSection: selectorByClassPrefix("style__TocSection"),
        tocExpand: selectorByClassPrefix("style__TocExpand"),
        searchBox: selectorByAttributeValue("placeholder", "Search within ASMaster"),
        searchResults: selectorByClassPrefix("style__SearchResultsContainer"),
        normativeReferences: selectorById("toc__sec_2"),
        section3: selectorById("toc__sec_3"),
        ereaderContent: "ereader-content",
        tocSection: selectorByClassPrefix("style__TocSection"),
        loginUsername: selectorByAttributeValue("name", "email"),
        loginPassword: selectorByAttributeValue("name", "password"),
        loginContainer: selectorByClassPrefix("style__ButtonContainer"),
        headerContainer: selectorByClassPrefix("style__DesktopMenuContainer"),
        readerHeader: selectorByClassPrefix("style__ReaderHeaderControls-sc"),
        bookmarkIcon: selectorByAttributeValue("data-cy", "icon-bookmark"),
        highlightIcon: selectorByAttributeValue("data-cy", "icon-highlight"),
        popupContainer: selectorByClassPrefix("marker-popup-container"),
        bookmarkFilled: selectorByAttributeValue("data-cy", "icon-bookmarkfilled"),
        bookmarkBin: selectorByAttributeValue("data-cy", "icon-bin"),
        buttonSection: selectorByClassPrefix("style__ModalButtonSection-sc"),
        commentIcon: selectorByAttributeValue("data-cy", "icon-comment"),
        commentText: selectorByClassPrefix("style__TextArea-sc"),
        commonButton: selectorByClassPrefix("style__CommonButtons-sc"),
        closeIcon: selectorByAttributeValue("data-cy", "icon-close"),
    };

    const getEReaderContentDiv = (frameId) => {
        return cy
            .get('div[id="' + frameId + '"]')
            .should('exist')
    };

    const getEReaderContent = (frameId) => {
        // get the document
        return getEReaderContentDiv(frameId)
            .then(cy.wrap)
    };

    it("Makes sure the delivery service is working", () => {
        // Make sure health check URL is active, this helps assess availability of service once deployed
        cy.visit("http://localhost:5002/");
        cy.contains("Delivery service is running successfully");

        // Accessing a preview URL returns a 200 without authentication
        cy.request("http://localhost:5002/shop/publications/preview", {
            qs: {
                designationId: "ASMaster"
            }
        });
    });

    it("Visits the health check URLs for ingestor service", () => {
        cy.visit("http://localhost:5001/");
        cy.contains("Ingestor Service Stats");
    });

    it("Loads an eReader preview for ASMaster", () => {
        // Specify which API's will be called and set as objects.
        // Without setting up an API route cypress won't wait for the API's
        // Note: These are calling the internal API's and are NOT mocked
        cy.server().route('GET', '**/preview?designationId=ASMaster&startingIndex=42').as('fetchPreview').debug();
        cy.server().route('GET', '**/toc?designationId=ASMaster').as('fetchToc').debug();

        // Open up the master document
        cy.visit("/reader?designationId=ASMaster&preview=1").debug();

        // Wait for the API's defined above
        cy.wait(['@fetchPreview', '@fetchToc']).debug()
            // as cypress doesn't fully support iframe loading
            // cypress documentation suggest waiting for the iframe to render before returning it 
            .wait(500);

        // Ensure content loads (we're using a string from the top of, and another from the bottom of the document)
        //Moved this to the top as this should be the first thing that it checks. Data has been loaded.
        getEReaderContent(selectors.ereaderContent)
            .contains("AS Master sample — XML data testing, Part 1: Data set — Title testing");

        // Ensure opening specific ToC item works
        cy.contains("1 Scope and general")
            .parent()
            .parent()
            .find(selectors.tocExpand)
            .click();

        // Ensure ToC is displayed
        cy.get(selectors.tocContainer)
            .should("be.visible")
            .then(() => {
                cy.contains("Preface")
                cy.contains("1.2 Normative references");
                //cy.contains("Terms and definitions").should('have.class', 'disabled') 
            });

        //cy.get(selectors.tocSection).eq(7).children('.style__TocTitle-x3dh7h-30.chLYno').children().should('have.class', 'disabled') 

        //  Test to navigate from TOC
        cy.get(selectors.tocContainer)
            .contains("2 Normative references")
            .click()

        cy.get(selectors.normativeReferences)
            .scrollIntoView();

        getEReaderContent(selectors.ereaderContent)
            .contains("Footnote. Used very rarely in Standards. Typically only to advise readers at Public Comment that a related document is under development.");

        // Make sure we can close the ToC
        cy.get(selectors.tocToggle)
            .click();

        cy.get(selectors.tocContainer)
            .should('not.be.visible');

        // test search with no results
        cy.get(selectors.searchBox)
            .type("{selectall}Apple pie is delicious");

        cy.contains("No Match Found");

        // Test search with results
        cy.get(selectors.searchBox)
            .click()
            .type("{selectall}This clause is new to");

        // Navigate to search results
        cy.get(selectors.searchResults)
            .scrollIntoView()
            .contains("This Clause is new to").click();

        /*getEReaderContent(selectors.ereaderContent)
            .find(selectors.appendixA)
            .should('be.visible');*/
    });

    it("Loads an interactive eReader for ASMaster", () => {

        Cypress.on('uncaught:exception', (err, runnable) => {
            return false;
        });
        Cypress.config('defaultCommandTimeout', 20000)
        Cypress.config('requestTimeout', 50000)
        Cypress.config('responseTimeout', 50000)

        // Let's login first.
        cy.visit("/login");
        cy.login();

        // Verify if the login is successful.  
        cy.get(selectors.headerContainer)
            .contains("Account")

        // Let's open eReader now.
        cy.server().route('GET', '**/content?designationId=ASMaster&startingIndex=42').as('fetchContent42');
        cy.server().route('GET', '**/toc?designationId=ASMaster').as('fetchToc');
        cy.server().route('POST', '**/bookmarks/create').as('bookmarkcreate')

        // Open up the master document
        cy.visit("/reader?designationId=ASMaster")

        // Wait for the API's defined above
        cy.wait(['@fetchContent42', '@fetchToc'])

        // Ensure opening specific ToC item works
        cy.contains("1 Scope and general")
            .parent()
            .parent()
            .find(selectors.tocExpand)
            .click();

        // Ensure ToC is displayed
        cy.get(selectors.tocContainer)
            .should("be.visible")
            .then(() => {
                cy.contains("Preface")
                cy.contains("1.2 Normative references")
                cy.contains("Terms and definitions").should('not.have.class', 'disabled')
            });

        //  Test to navigate from TOC
        cy.get(selectors.tocContainer).contains("2 Normative references").click();

        cy.get(selectors.normativeReferences).scrollIntoView();

        cy.get(selectors.tocContainer)
            .contains("Terms and definitions")
            .click()

        cy.get(selectors.section3)
            .scrollIntoView();

        // Bookmark Normative references section
        cy.get(selectors.readerHeader)
            .children()
            .children()
            .children()
            .find(selectors.bookmarkIcon)
            .click()
        cy.get(selectors.normativeReferences)
            .scrollIntoView({ offset: { top: -100, left: 0 } })
        cy.get(selectors.normativeReferences)
            .parents()
            .parents()
            .siblings()
            .children()
            .children()
            .children()
            .children(selectors.bookmarkIcon).invoke('show')
            .click({ force: true })

        // Add a Comment 
        cy.get(selectors.bookmarkFilled)
            .click();
        cy.get(selectors.commentIcon)
            .click();
        cy.get(selectors.commentText)
            .type("Shop Comment")
        cy.get(selectors.commonButton)
            .contains("Save")
            .click()
        cy.get(selectors.closeIcon)
            .click({ multiple: true });

        // Delete Bookmark and Comment  
        cy.get(selectors.normativeReferences)
            .scrollIntoView({ offset: { top: -200, left: 0 } })
        cy.get(selectors.bookmarkBin)
            .click();
        cy.get(selectors.buttonSection)
            .contains("Delete")
            .click()

    })
});
