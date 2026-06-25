import React from 'react'
import { CartProvider } from './ContextV3/_CountContext'
import AddToCart from './ContextV3/AddToCart'
import CartTotalItems from './ContextV3/CartTotalItems'

export default function App() {
  return (
    <CartProvider>
      <CartTotalItems />
      <AddToCart />
    </CartProvider>
  )
}
