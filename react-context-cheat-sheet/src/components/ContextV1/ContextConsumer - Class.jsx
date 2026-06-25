import React from 'react'
import Button from '@material-ui/core/Button'
import UserContext, { ProductConsumer } from './Context'

export default class ContextConsumerClass extends React.Component {
  // eslint-disable-next-line react/static-property-placement
  static contextType = UserContext

  componentDidMount() {
    const user = this.context
    console.log(user)
  }

  render() {
    return (
      <div>
        <ProductConsumer>
          {props => {
            return (
              <Button variant="contained" color="primary">
                {props.name}
              </Button>
            )
          }}
        </ProductConsumer>
      </div>
    )
  }
}
