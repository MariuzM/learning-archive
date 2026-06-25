import React, { useContext, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../utils/context'
import NavBarItem from '../components/NavBarItem'
import Button from '../components/Button'
import { TypeEdit, MoreValues, Filter } from '../@types/Types'

const ProductEdit = (): JSX.Element => {
  const { state, setState, qntHis, setQntHis, prcHis, setPrcHis } = useContext(AppContext)
  const { id } = useParams()
  const [editState, setEditState] = useState<TypeEdit & MoreValues>({ key: +id })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, name?: string): void => {
    setEditState({ ...editState, name, [e.currentTarget.name]: +e.currentTarget.value })
  }

  const handleSubmit = (): void => {
    setState(state.map((el) => (el.key === +id ? { ...el, ...editState } : el)))

    const historyFunc: Filter = (hstState, updateState, param): void => {
      const d = new Date()
      const date = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
      const time = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`

      if (hstState.length >= 5) {
        const arr = hstState
        arr.shift()
        updateState([
          ...arr,
          { key: parseFloat(id), name: editState.name, data: param, date, time },
        ])
      } else {
        updateState([
          ...hstState,
          { key: parseFloat(id), name: editState.name, data: param, date, time },
        ])
      }
    }

    if (editState.quantity || editState.quantity === 0) {
      historyFunc(qntHis, setQntHis, editState.quantity)
    }
    if (editState.price || editState.price === 0) {
      historyFunc(prcHis, setPrcHis, editState.price)
    }
  }

  return (
    <div>
      <NavBarItem link="/products" value="Products List" />

      {state.map(({ key, name, ean, type, weight, color, quantity, price, active }) => {
        return +id === key ? (
          <div key={key}>
            <h3>{`Product Name: ${name}`}</h3>
            <p>{`Product Ean: ${ean}`}</p>
            <p>{`Product Type: ${type}`}</p>
            <p>{`Product Weight: ${weight}`}</p>
            <p>{`Product Color: ${color}`}</p>

            <p>
              {`Product Quantity: ${quantity}`}
              <input
                type="number"
                name="quantity"
                step="0"
                // value={editState.quantity}
                onChange={(e): void => handleChange(e, name)}
              />
            </p>

            <p>
              {`Product Price: $${price}`}
              <input
                type="number"
                name="price"
                step="0.01"
                // value={editState.price ? editState.price : price}
                onChange={(e): void => handleChange(e, name)}
              />
            </p>

            <p>{active ? 'Product is Active' : 'Product is not Active'}</p>
          </div>
        ) : null
      })}
      <Button value="Submit" color="btn-secondary" onClick={handleSubmit} />
    </div>
  )
}

export default ProductEdit
