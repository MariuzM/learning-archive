import React, { useState } from 'react'
import axios from 'axios'

const currentHost = window.location.href
console.log(window.location)

export default function App() {
  const [subState1, setSubState1] = useState()
  const [subState2, setSubState2] = useState()
  const [subState3, setSubState3] = useState()
  const [subState4, setSubState4] = useState()

  const submit1 = async () => {
    await axios
      .post(`${currentHost}_base`)
      .then((res) => setSubState1(res.data.data))
      .catch((err) => console.log(err))
  }

  const submit2 = async () => {
    await axios
      .post(`_base`)
      .then((res) => setSubState2(res.data.data))
      .catch((err) => console.log(err))
  }

  const submit3 = async () => {
    await axios
      .post(`https://determined-curie-bc9b33.netlify.app/.netlify/functions/_base`)
      .then((res) => setSubState3(res.data.data))
      .catch((err) => {
        setSubState3('- Error, check Console')
        console.log(err)
      })
  }

  const submit4 = async () => {
    await axios
      .post(`/_base2`)
      .then((res) => setSubState4(res.data.data))
      .catch((err) => console.log(err))
  }

  return (
    <>
      <div>
        <button type="button" onClick={submit1}>
          Test 1 {subState1}
        </button>
      </div>

      <div>
        <button type="button" onClick={submit2}>
          Test 2 {subState2}
        </button>
      </div>

      <div>
        <button type="button" onClick={submit3}>
          Netlify App {subState3}
        </button>
      </div>

      <div>
        <button type="button" onClick={submit4}>
          Another Button {subState4}
        </button>
      </div>
    </>
  )
}
