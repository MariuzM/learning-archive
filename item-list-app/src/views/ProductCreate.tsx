import React, { useContext, useState, useEffect } from 'react'
import { css } from '@emotion/core'
import { AppContext } from '../utils/context'
import { TypeList } from '../@types/Types'

const object = [
  { id: 1, name: 'name', type: 'text' },
  { id: 2, name: 'ean', type: 'number' },
  { id: 3, name: 'type', type: 'text' },
  { id: 4, name: 'weight', type: 'number' },
  { id: 5, name: 'color', type: 'text' },
  { id: 6, name: 'quantity', type: 'number' },
  { id: 7, name: 'price', type: 'number' },
]

const formStyle = css`
  input {
    width: 300px;
  }
`

const ProductCreate: React.FC = (): JSX.Element => {
  const { state, setState } = useContext(AppContext)
  const [formState, setFormState] = useState<TypeList[]>([])
  const keyValue = state[Object.keys(state).length - 1].key + 1

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    setState([...state, formState])
  }

  const handleChange = (name: string, type: string) => (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    if (type === 'text') {
      const newContact = {
        ...formState,
        key: keyValue,
        [name]: event.currentTarget.value,
        active: event.currentTarget.checked,
      }
      setFormState(newContact)
    }

    if (type === 'number') {
      const newContact = {
        ...formState,
        key: keyValue,
        [name]: parseFloat(event.currentTarget.value),
        active: event.currentTarget.checked,
      }
      setFormState(newContact)
    }

    if (type === 'checkbox') {
      const newContact = {
        ...formState,
        key: keyValue,
        active: event.currentTarget.checked,
      }
      setFormState(newContact)
    }
  }

  useEffect(() => {
    console.log(formState)
  }, [formState])

  return (
    <form className="form-group" css={formStyle} onSubmit={handleSubmit}>
      <input
        type="number"
        id="key"
        name="key"
        className="form-control mt-2"
        placeholder={keyValue.toString()}
        onChange={handleChange('key', 'number')}
        disabled
      />

      {object.map(({ id, name, type }) => {
        return (
          <input
            key={id}
            type={type}
            id={name}
            name={name}
            className="form-control mt-2"
            placeholder={name.charAt(0).toUpperCase() + name.slice(1)}
            onChange={handleChange(name, type)}
            // required
          />
        )
      })}

      <input
        type="checkbox"
        id="checkbox"
        name="checkbox"
        onChange={handleChange('checkbox', 'checkbox')}
      />

      <input type="submit" value="Submit" />
    </form>
  )
}

export default ProductCreate
