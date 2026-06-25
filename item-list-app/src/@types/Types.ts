export type TypeList = {
  key: number
  name: string
  ean: number
  type: string
  weight: number
  color: string
  quantity: number
  price: number
  active: boolean
}

export type StateHst = {
  key: number
  name: string
  data?: number
  price?: number
  date: string
  time: string
}

export type Type = { state: StateHst[] }

export type TypeEdit = { key: number; quantity?: number; price?: number }
export type MoreValues = { name?: string; date?: string; time?: string }

export type Filter = { (hstState: object[], updateState: Function, param: number): void }
