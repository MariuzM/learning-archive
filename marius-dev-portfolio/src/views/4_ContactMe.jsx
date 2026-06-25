import React, { useState, useRef, useEffect } from 'react'
import { Element } from 'react-scroll'
import axios, { qs } from 'axios'
import * as Yup from 'yup'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { css } from '@emotion/core'
import Title from '../components/Title'
import Button from '../components/Button'

import style from '../styles/_main.css'

const footContact = css`
  padding: 0 50px 30px 50px;
  @media only screen and (max-width: 600px) {
    padding: 0 20px 90px 20px;
  }

  > div {
    > input[type='text'],
    > input[type='email'],
    > input[type='message'] {
      &:valid {
        /* background: url(images/check.svg); */
        background-size: 20px;
        background-repeat: no-repeat;
        background-position: 20px 20px;

        // continue to hide the label
        & + label {
          opacity: 0;
        }
      }
    }
  }

  .form-wrap {
    margin-bottom: 20px;
    .form-input {
      list-style: none;
      display: block;
      width: 100%;
      font-size: 17px;
      line-height: 1.2;
      padding: 0 10px;
      border-radius: 2px;
      background: transparent;
      outline: 0;
      border-width: 0px;
      color: var(--font_color);
      ::placeholder {
        color: var(--placeholder);
      }
      &:focus {
        outline: 0;
      }
      &:focus + .focus-input::before {
        width: 100%;
      }
    }

    input.form-input {
      height: 45px;
    }
    textarea.form-input {
      min-height: 115px;
      padding-top: 13px;
      padding-bottom: 13px;
      box-sizing: border-box;
      border: 0;
      resize: none;
      &:focus {
        outline: 0;
      }
    }
    .focus-input {
      display: block;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      pointer-events: none;
      ::after {
        content: '';
        display: block;
        position: absolute;
        z-index: 1;
        bottom: -2px;
        left: 0;
        width: 100%;
        height: 2px;
        transition: all 0.4s;
        background: var(--font_color);
      }
      ::before {
        content: '';
        display: block;
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 0;
        height: 2px;
        transition: all 0.4s;
        background: var(--font_color_hover);
        z-index: 2;
      }
    }
  }
  .form-valid {
    position: relative;
  }
  .form-error {
    font-size: 0.8rem;
    position: absolute;
    display: block;
    transform: translate(10px, -15px);
    color: red;
  }
`

export default function ContactMe() {
  const [button, setButton] = useState('Say Hello')
  const [color, setColor] = useState(style)

  const formSchema = Yup.object().shape({
    name: Yup.string().required('Required'),
    email: Yup.string().email('Invalid email').required('Required'),
    message: Yup.string().required('Required'),
  })

  // const handleOnSubmit = async (value, actions) => {
  //   const localHost = process.env.HOST_NAME
  //   await axios
  //     .post(`${localHost || 'https://www.marius.dev'}/send`, {
  //       headers: { 'Content-Type': 'application/json' },
  //       data: value,
  //     })
  //     .then((res) => {
  //       console.log('Message', res.data.message)
  //       console.log('Error', res.data.error)
  //       setButton('Message Sent')
  //       actions.setSubmitting(false)
  //       actions.resetForm()
  //       setColor({
  //         ...color,
  //         buttonBackground: color.buttonColorSucess,
  //         buttonBackgroundActive: color.buttonColorSucessDarker,
  //       })
  //     })
  //     .catch((err) => {
  //       console.log(err)
  //       setButton('Network Error Sending Message')
  //       actions.setErrors(true)
  //       setColor({
  //         ...color,
  //         buttonBackground: color.buttonColorError,
  //       })
  //     })
  // }

  // const rcRef = useRef(null)

  return (
    <Element className="basic-template" name="contact-me">
      <Title value="Contact Me" />
      {/* <Formik
        initialValues={{
          'bot-field': '',
          'form-name': 'contact',
          name: '',
          email: '',
          message: '',
        }}
        validationSchema={formSchema}
        method="POST"
        data-netlify="true"
        onSubmit={(values) => {
          // setIsSubmitting(true)
          // setFormValues({ ...values })
          // setExecuting(true)
          rcRef.current.execute()
        }}
      >
        {({ isSubmitting }) => {
          return (
            <Form css={footContact}>
              <div className="form-wrap form-valid">
                <Field type="hidden" name="bot-field" />
                <Field type="hidden" name="form-name" />

                <Field
                  className="form-input"
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Name"
                />
                <span className="focus-input" />
              </div>

              <ErrorMessage name="name" className="form-error" component="p" />

              <div className="form-wrap form-valid">
                <Field
                  className="form-input"
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Email"
                />
                <span className="focus-input" />
              </div>

              <ErrorMessage name="email" className="form-error" component="p" />

              <div className="form-wrap form-valid">
                <Field
                  className="form-input"
                  id="message"
                  name="message"
                  component="textarea"
                  placeholder="Message"
                />
                <span className="focus-input" />
              </div>

              <ErrorMessage name="message" className="form-error" component="p" />

              <Button type="submit" disabled={isSubmitting} style={color} value={button} />
            </Form>
          )
        }}
      </Formik> */}

      <form name="contact" method="POST" data-netlify="true" css={footContact}>
        <input type="hidden" name="form-name" value="contact" />

        <div className="form-wrap form-valid">
          <input className="form-input" type="text" name="name" placeholder="Name" required />
          <span className="focus-input" />
        </div>

        <div className="form-wrap form-valid">
          <input className="form-input" type="email" name="email" placeholder="Email" required />
          <span className="focus-input" />
        </div>

        <div className="form-wrap form-valid">
          <textarea className="form-input" name="message" placeholder="Message" required />
          <span className="focus-input" />
        </div>

        <Button type="submit" style={color} value={button} />
      </form>
    </Element>
  )
}
