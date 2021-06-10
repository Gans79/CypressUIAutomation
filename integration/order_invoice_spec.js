import { selectorByClassPrefix } from '../utils/selectors';

describe("Order Invoice", () => {
    const selectors = {
        headerContainer: selectorByClassPrefix("style__DesktopMenuContainer"),
        purchaseHistoryTab: selectorByClassPrefix("style__ShopTabFlexContainer"),
        order: selectorByClassPrefix("style__OrderHistoryData"),
        orderHistoryTitle: selectorByClassPrefix("style__OrderHistoryTitle"),
        download: selectorByClassPrefix("style__ButtonValue"),
        viewInvoiceButton: selectorByClassPrefix("style__ButtonValue"),
        emptyOrder: selectorByClassPrefix("style__EmptyWorkspaceHeader")
    };

    it("Loads Order Invoice", () => {
        goToPurchaseHistory()

        //check the columns
        cy.get(selectors.orderHistoryTitle).contains("Order #");
        cy.get(selectors.orderHistoryTitle).contains("Order Date");
        cy.get(selectors.orderHistoryTitle).contains("Amount");

        //check if "View Invoice" button exists
        cy.get(selectors.viewInvoiceButton).contains("View Invoice");

        //click on the order number
        cy.get(selectors.order).first().click()

        //todo: check download pdf works
        //cy.server({
        //    status: 500,
        //    method: 'GET',
        //})
        //cy.route('**shop/pdf/invoice?cartCode**').as('downloadInvoice');

        cy.get(selectors.download).contains("Download")
    })

    it("User has no past purchase history", () => {
        cy.server()
        cy.route({
            method: 'GET',
            url: '**shop/orders?status**',
            status: 200,
            response: []
        }).as('purchaseHistory');

        goToPurchaseHistory()        

        //no recent orders message
        cy.get(selectors.emptyOrder).contains("No recent orders")
    })

    const goToPurchaseHistory = () => {
        // Let's login first.
        cy.visit("/login");
        cy.login();

        // Verify if the login is successful.  
        cy.get(selectors.headerContainer).contains("Account")

        // Open up the workspace
        cy.visit("/workspace")

        //click the Orders / Purchase
        cy.get(selectors.purchaseHistoryTab).contains("Orders / Purchase History").click()
    }
});