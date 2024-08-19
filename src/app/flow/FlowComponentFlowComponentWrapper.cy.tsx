import React from 'react'
import FlowComponentWrapper from './FlowComponent'

describe('<FlowComponentWrapper />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<FlowComponentWrapper />)
  })
})