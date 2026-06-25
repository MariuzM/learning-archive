import React, { useState } from 'react'
import { css } from '@emotion/core'
import { colorPickerPrimary, colorPickerSecondary } from '../utils/ColorPicker'

type PropThis = { name: string; handleChange: Function }
const EachButton: React.FC<PropThis> = ({ name, handleChange }): JSX.Element => {
  const [state, setState] = useState(true)

  const buttonStyle = css`
    padding: 15px;
    margin: 7px;
    cursor: pointer;
    user-select: none;
    outline: 0;
    border: none;
    font-size: 20px;
    font-weight: 800;
    text-transform: uppercase;
    border-radius: 6px;
    display: inline-block;
    letter-spacing: 2px;
    transition: all 0.3s ease 0s;
    input {
      cursor: pointer;
      appearance: none;
      position: relative;
      top: 2px;
      margin-right: 8px;
      border: 0px none;
      padding: 9px;
      border-radius: 50px;
      display: inline-block;
      transition: all 0.3s ease 0s;
    }
  `

  const togle = (): void => setState((prevState) => !prevState)

  return (
    <label
      htmlFor={name}
      css={[buttonStyle, colorPickerPrimary(name), state ? null : colorPickerSecondary(name)]}
    >
      <input
        type="checkbox"
        id={name}
        onChange={(el): void => handleChange(el, name)}
        onClick={togle}
        css={[colorPickerPrimary(name), state ? colorPickerSecondary(name) : null]}
      />
      {name}
    </label>
  )
}

const Button = ({ data, onChange }: { data: string[]; onChange: Function }): JSX.Element => {
  const [state, setState] = useState<string[]>([])
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>, name: string): void => {
    if (event.target.checked) {
      const filterItems = [...state, name]
      onChange(filterItems)
      setState(filterItems)
    } else {
      const filterItems = state.filter((item) => item !== name)
      onChange(filterItems)
      setState(filterItems)
    }
  }

  return (
    <>
      {data.map(
        (varData, index): JSX.Element => {
          const newIndex = { id: index + 1, data: varData }
          return (
            <div key={newIndex.id}>
              <EachButton name={newIndex.data} handleChange={handleChange} />
            </div>
          )
        },
      )}
    </>
  )
}

export default Button
