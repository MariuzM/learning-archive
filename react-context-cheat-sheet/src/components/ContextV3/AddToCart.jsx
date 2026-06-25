import React from 'react'
// import { useCart } from './_useContext';
import { CartContext } from './_CountContext'

// const AddToCart = () => {
//   const { incrementCartTotal } = useCart();
//   return <button onClick={incrementCartTotal}>Add to cart</button>;
// };
// export default AddToCart;

// export default function CartTotalItems() {
//   const { incrementCartTotal } = useCart();
//   return <button onClick={incrementCartTotal}>Add to cart</button>;
// }

// =========================================
// Disabled useCart in Context
// =========================================
export default function AddToCart() {
  const { incrementCartTotal } = React.useContext(CartContext)
  return (
    <button type="button" onClick={incrementCartTotal}>
      Add to cart
    </button>
  )
}
