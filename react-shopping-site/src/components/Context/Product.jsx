import React, { Component } from 'react';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { ProductConsumer } from './context';

export default class Product extends Component {
  render() {
    // eslint-disable-next-line
    const { id, title, img, price, inCart } = this.props.product;
    return (
      <ProductConsumer>
        {value => (
          <Box className="card card-1">
            <img src={img} alt="product" />
            <h3>{title}</h3>
            <p>{price}</p>
            <Button
              disabled={inCart ? true : false}
              onClick={() => {
                value.addToCart(id);
                // console.log(id);
              }}
            >
              Buy
              {inCart ? <p>In Cart</p> : <i>Not in Cart</i>}
            </Button>
          </Box>
        )}
      </ProductConsumer>
    );
  }
}
