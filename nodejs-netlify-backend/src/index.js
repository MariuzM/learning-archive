require('dotenv').config()
const express = require('express')
const path = require('path')

const { PORT } = process.env
const app = express()

app.use(express.json())

app.use(express.static('public'))

app.use('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'))
})

app.listen(PORT, () => console.log(`Listening at http://localhost:3000`))
