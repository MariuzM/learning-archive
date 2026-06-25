import React, { useState, useEffect } from 'react'
import { css } from '@emotion/core'
import Filters from './views/Filters'
import PlayerCards from './views/PlayerCards'
import db from './db/db'

const topMenuFilter = css`
  display: flex;
  align-items: center;
  justify-content: center;
  .filter {
    display: flex;
    align-items: center;
  }
`

export default function App(): JSX.Element {
  const [state] = useState(db.data)
  const [newData, setNewData] = useState(state)
  const [filter, setFilter] = useState<string[]>([])

  useEffect(() => {
    const updatedArr = state.map((e) => e.contentType)
    const uniqueArray = [...new Set(updatedArr.flat())]
    setFilter(uniqueArray)
  }, [state])

  const filterData = (selectedFilters: string[]): void => {
    if (!selectedFilters.length) return setNewData(state)
    const filteredData = state.filter((item) =>
      item.contentType.some((varFilter) => !!selectedFilters.includes(varFilter)),
    )
    setNewData(filteredData)
    return undefined
  }

  return (
    <>
      <div css={topMenuFilter}>
        <div className="filter">
          <Filters data={filter} onChange={filterData} />
        </div>
      </div>

      <PlayerCards players={newData} />
    </>
  )
}
