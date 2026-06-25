import React, { useState, createContext, useEffect } from 'react'
import list from '../db/items'
import { StateHst, TypeList } from '../@types/Types'

type ContextProps = {
  state: TypeList[]
  setState: Function
  toggle: (e: React.ChangeEvent<HTMLInputElement>) => void
  qntHis: StateHst[]
  setQntHis: Function
  prcHis: StateHst[]
  setPrcHis: Function
}

export const AppContext: React.Context<ContextProps> = createContext({} as ContextProps)

export const AppContextConsumer: React.FC = ({ children }): JSX.Element => {
  const [state, setState] = useState<TypeList[]>(list)
  const [qntHis, setQntHis] = useState<StateHst[]>([])
  const [prcHis, setPrcHis] = useState<StateHst[]>([])

  const toggle = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { id } = e.currentTarget
    const itemIndex: number = state.findIndex((item) => item.key === parseFloat(id))
    const newState: TypeList[] = state.slice()
    newState[itemIndex].active = !newState[itemIndex].active
    setState(newState)
  }

  useEffect(() => {
    // console.log('state', state)
    console.log('Quantity', qntHis)
    console.log('Price', prcHis)
  }, [prcHis, qntHis])

  return (
    <AppContext.Provider value={{ state, setState, toggle, qntHis, setQntHis, prcHis, setPrcHis }}>
      {children}
    </AppContext.Provider>
  )
}
