import React, { useContext } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../utils/context'
import NavBarItem from '../components/NavBarItem'

const ProductView = (): JSX.Element => {
  const { state } = useContext(AppContext)
  const { id } = useParams()

  return (
    <div>
      <NavBarItem link="/products" value="Products List" />

      {state.map(({ key, name, ean, type, weight, color, quantity, price, active }) => {
        return parseFloat(id) === key ? (
          <div key={key}>
            <h3>{`Product Name: ${name}`}</h3>
            <p>{`Product Ean: ${ean}`}</p>
            <p>{`Product Type: ${type}`}</p>
            <p>{`Product Weight: ${weight}`}</p>
            <p>{`Product Color: ${color}`}</p>
            <p>{`Product Quantity: ${quantity}`}</p>
            <p>{`Product Price: $${price}`}</p>
            <p>{active ? 'Product is Active' : 'Product is not Active'}</p>
          </div>
        ) : null
      })}
    </div>
  )
}

export default ProductView
