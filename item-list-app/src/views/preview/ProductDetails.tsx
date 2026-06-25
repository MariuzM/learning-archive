import React, { useContext } from 'react'
import { AppContext } from '../../utils/context'
import TableHead from '../../components/TableHead'

const ProductDetails: React.FC = (): JSX.Element => {
  const { state } = useContext(AppContext)

  return (
    <div>
      <TableHead quantity="Quantity" price="Price">
        {state.map(({ key, active, name, ean, type, weight, color, quantity, price }) => {
          return (
            <tbody key={key}>
              {active ? (
                <tr style={{ background: `${quantity === 0 ? '#e7a52a' : ''}` }}>
                  <td>{name}</td>
                  <td>{ean}</td>
                  <td>{type}</td>
                  <td>{weight}</td>
                  <td>{color}</td>
                  <td>{quantity}</td>
                  <td>{price}</td>
                </tr>
              ) : null}
            </tbody>
          )
        })}
      </TableHead>
    </div>
  )
}

export default ProductDetails
