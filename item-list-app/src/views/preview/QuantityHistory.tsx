import React, { useContext } from 'react'
import Charts from '../../components/Charts'
import { AppContext } from '../../utils/context'

const QuantityHistory: React.FC = (): JSX.Element => {
  const { qntHis } = useContext(AppContext)

  return <Charts state={qntHis} />
}

export default QuantityHistory
