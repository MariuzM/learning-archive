import React, { useContext } from 'react'
import Charts from '../../components/Charts'
import { AppContext } from '../../utils/context'

const PriceHistory: React.FC = (): JSX.Element => {
  const { prcHis } = useContext(AppContext)

  return <Charts state={prcHis} />
}

export default PriceHistory
