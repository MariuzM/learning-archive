import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { NavTab } from 'react-router-tabs'
import { css } from '@emotion/core'

import ProductDetails from './preview/ProductDetails'
import PriceHistory from './preview/PriceHistory'
import QuantityHistory from './preview/QuantityHistory'

const navStyle = css`
  .nav-tab {
    background-color: var(--background);
    display: inline-block;
    padding: 10px 25px;
    text-decoration: none;
    :hover {
      background-color: #343a40;
    }
    &.active {
      color: #555;
      cursor: default;
    }
  }
`

const List: React.FC = (): JSX.Element => {
  return (
    <div css={navStyle}>
      <ul className="nav justify-content-center">
        <NavTab to="/preview/product_details">Product details</NavTab>
        <NavTab to="/preview/price_history">Price history</NavTab>
        <NavTab to="/preview/quantity_history">Quantity History</NavTab>
      </ul>

      <Switch>
        <Route exact path="/preview/product_details" component={ProductDetails} />
        <Route exact path="/preview/price_history" component={PriceHistory} />
        <Route exact path="/preview/quantity_history" component={QuantityHistory} />
      </Switch>
    </div>
  )
}

export default List
