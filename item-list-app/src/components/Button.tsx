import React from 'react'

type Type = {
  value: string
  color: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

const Button: React.FC<Type> = ({ value, color, onClick }): JSX.Element => {
  return (
    <>
      <button type="button" style={{ margin: '2px' }} className={`btn ${color}`} onClick={onClick}>
        {value}
      </button>
    </>
  )
}

export default Button
