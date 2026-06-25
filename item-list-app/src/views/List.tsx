import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../utils/context'
import Button from '../components/Button'
import TableHead from '../components/TableHead'

const List: React.FC = (): JSX.Element => {
  const { state, setState, toggle } = useContext(AppContext)

  return (
    <>
      <TableHead active="Active">
        <tbody>
          {state.map(({ key, name, ean, type, weight, color, active }) => {
            const deleteEntry = (): void => {
              setState(state.filter((item) => item.key !== key))
            }

            return (
              <tr key={key}>
                <td className="align-middle">{name}</td>
                <td className="align-middle">{ean}</td>
                <td className="align-middle">{type}</td>
                <td className="align-middle">{weight}</td>
                <td className="align-middle">{color}</td>

                <td className="align-middle">
                  <input
                    type="checkbox"
                    id={key.toString()}
                    name={name}
                    checked={active}
                    onChange={toggle}
                  />
                </td>

                <td className="align-middle">
                  <Link to={`/products/${key}`}>
                    <Button value="View" color="btn-secondary" />
                  </Link>

                  <Link to={`/products/${key}/edit`}>
                    <Button value="Edit" color="btn-warning" />
                  </Link>

                  <Button value="Delete" color="btn-danger" onClick={deleteEntry} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </TableHead>

      <Link to="/products/create">
        <button type="button" className="btn btn-secondary">
          New Item
        </button>
      </Link>
    </>
  )
}

export default List
