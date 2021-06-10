// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import {
    selectorByAttributeValue,
    selectorByClassPrefix
} from '../utils/selectors';

const selectors = {
    loginUsername: selectorByAttributeValue("name", "email"),
    loginPassword: selectorByAttributeValue("name", "password"),
    loginContainer: selectorByClassPrefix("style__ButtonContainer"),

};

Cypress.Commands.add("login", (pathName, skipCartApi) => {
    cy.server().route('POST', '**/login').as('login').debug();
    cy.server().route('GET', '**/cart').as('cart').debug();

    cy.get(selectors.loginUsername)
        .type("test@automation.com")
    cy.get(selectors.loginPassword)
        .type("Shop1234")
    cy.get(selectors.loginContainer)
        .contains("Login")
        .click()

    // wait for login API
    cy.wait(['@login'])
    if (skipCartApi) {
        // Skipping Cart
        cy.debug('Skipping wait for @cart')
    } else {
        // wait for cart API
        cy.wait(['@cart'])
    }
    // wait for home page
    cy.location('pathname').should('eq', pathName ?? '/')
})