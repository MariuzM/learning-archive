import React from 'react'

type Element = { children: React.ReactNode; active?: string; quantity?: string; price?: string }
const TableHead: React.FC<Element> = ({ children, active, quantity, price }): JSX.Element => {
  return (
    <table className="table table-striped">
      <thead className="thead-dark">
        <tr>
          <th>Name</th>
          <th>EAN</th>
          <th>Type</th>
          <th>Weight</th>
          <th>Color</th>
          {active ? <th>{active}</th> : null}
          {quantity ? <th>{quantity}</th> : null}
          {price ? <th>{price}</th> : null}
        </tr>
      </thead>
      {children}
    </table>
  )
}

export default TableHead
