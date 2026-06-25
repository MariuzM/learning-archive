import React, { useState, useEffect } from 'react'
import PubNub from 'pubnub'
import { PubNubProvider } from 'pubnub-react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'

import './App.scss'

const pubnub = new PubNub({
  publishKey: 'YOUR_PUBNUB_PUBLISH_KEY',
  subscribeKey: 'YOUR_PUBNUB_SUBSCRIBE_KEY',
  // uuid: item,
  ssl: true,
})

const channels = ['myTestChannel']

export default function App() {
  const [open, setOpen] = useState(true)
  const [uuid, setUuid] = useState([])
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  const sendMessage = msg => {
    if (msg) {
      pubnub.publish({
        channel: channels[0],
        message: {
          message: msg,
          uuid,
        },
      })
      setInput('')
    }
  }

  useEffect(() => {
    pubnub.subscribe({ channels })

    pubnub.history(
      { channel: channels, count: 2, stringifiedTimeToken: true },
      (s, r) => {
        const temp = []
        for (let i = 0; i < r.messages.length; i += 1) {
          temp.push(r.messages[i].entry)
        }
        setMessages(() => temp)
      },
    )

    pubnub.addListener({
      message: msg => {
        // console.log('event', msg)
        setMessages(prevState => [
          ...prevState,
          { message: msg.message.message, uuid: msg.message.uuid },
        ])
      },
    })
  }, [])

  const handleSubmit = () => {
    setOpen(false)
  }

  const handleClose = () => {
    setUuid('')
    setOpen(false)
  }

  return (
    <PubNubProvider client={pubnub}>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Enter your name"
            type="text"
            onChange={e => setUuid(e.target.value)}
            fullWidth
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>

          <Button onClick={handleSubmit} color="primary">
            Enter
          </Button>
        </DialogActions>
      </Dialog>

      <div className="container">
        {/* {console.log('Test Run 3')} */}
        <div className="chat">
          {messages.map((m, mI) => {
            // console.log(m.uuid)
            return (
              <div key={[mI]}>
                <div
                  className={`speech-bubble speech-bubble-${
                    uuid !== m.uuid ? 'left' : 'right'
                  }`}
                >
                  <div className="uuid">{m.uuid}</div>
                  <div>{m.message}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="input-button">
        <TextField
          className="msg-button"
          label="Type your message"
          value={input}
          onChange={e => setInput(e.target.value)}
        />

        <Button
          type="button"
          color="primary"
          variant="contained"
          onClick={e => {
            e.preventDefault()
            sendMessage(input)
          }}
        >
          Send Message
        </Button>
      </div>
    </PubNubProvider>
  )
}
