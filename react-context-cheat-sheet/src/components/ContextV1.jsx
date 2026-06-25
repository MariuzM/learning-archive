import React from 'react'
import { ProductProvider } from './ContextV1/Context'
import ContextConsumerClass from './ContextV1/ContextConsumer - Class'
import ContextConsumerFunction from './ContextV1/ContextConsumer - Function'

export default function ContextV1() {
  const classVal = {
    name: 'This is a Class Context',
    value: true,
  }

  const functionVal = {
    name: 'This is a Function Context',
    value: true,
  }

  return (
    <>
      <ProductProvider value={classVal}>
        <ContextConsumerClass />
      </ProductProvider>
      <ProductProvider value={functionVal}>
        <ContextConsumerFunction propFromContextConsumerFunction={functionVal.name} />
      </ProductProvider>
    </>
  )
}
