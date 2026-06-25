/* eslint-disable no-param-reassign */
import React from 'react'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import { Type } from '../@types/Types'
// import { AppContext } from '../utils/context'

const Charts: React.FC<Type> = ({ state }): JSX.Element => {
  const mergeTime: string[] = []
  state.map((e) => mergeTime.push(e.time))
  console.log(mergeTime)

  // type History = { key: number; name: string; data: string[] }
  const result = Object.values(
    state.reduce((r: any, { key, name, data }) => {
      if (!r[key]) r[key] = { key, name, data: [] }
      r[key].data.push(data)
      return r
    }, {}),
  )

  const options = {
    xAxis: {
      categories: [
        'First Change',
        'Second Change',
        'Third Change',
        'Fourth Change',
        'Fifth Change',
      ],
    },
    series: result,
  }

  return (
    <div>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  )
}

export default Charts
