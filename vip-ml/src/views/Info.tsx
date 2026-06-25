import React, { useState } from 'react'

const agenturos = [
  {
    id: 1,
    pavadinimas: 'Adecco',
    telefonas: '0161 233 8100',
    elPastas: 'linda.reynolds@adecco.co.uk',
    puslapis: 'www.adecco.co.uk',
  },
]

export default function Info(): JSX.Element {
  const [state] = useState(agenturos)

  return (
    <table className="table">
      <thead>
        <tr>
          <th scope="col">Pavadinimas</th>
          <th scope="col">Telefonas</th>
          <th scope="col">EL Pastas</th>
          <th scope="col">Puslapis</th>
        </tr>
      </thead>
      <tbody>
        {state.map((e) => {
          const { id, pavadinimas, telefonas, elPastas, puslapis } = e
          return (
            <tr key={id}>
              <td>{pavadinimas}</td>
              <td>{telefonas}</td>
              <td>{elPastas}</td>
              <td>{puslapis}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
