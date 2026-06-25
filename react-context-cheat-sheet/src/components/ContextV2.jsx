import React from 'react'
import ToggleButton from './ContextV2/ToggleButton'
import Navbar from './ContextV2/Navbar'
import BookList from './ContextV2/BookList'
import { ContextProvider } from './ContextV2/_context'

export default function Context() {
  return (
    <div className="App">
      <ContextProvider>
        <Navbar />
        <BookList />
        <ToggleButton />
      </ContextProvider>
    </div>
  )
}
