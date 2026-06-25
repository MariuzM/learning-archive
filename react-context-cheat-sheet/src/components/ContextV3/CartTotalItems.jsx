import React from 'react'
// import { useCart } from './_useContext';
import { CartContext } from './_CountContext'

// const CartTotalItems = () => {
//   const { cartTotal } = useCart();
//   return <p>Total items currently in cart: {cartTotal}</p>;
// };
// export default CartTotalItems;

// export default function CartTotalItems() {
//   const { cartTotal } = useCart();
//   return <p>Total items currently in cart: {cartTotal}</p>;
// }

// =========================================
// Disabled useCart in Context
// =========================================
export default function CartTotalItems() {
  const { cartTotal } = React.useContext(CartContext)
  return (
    <p>
      Total items currently in cart:
      {cartTotal}
    </p>
  )
}
