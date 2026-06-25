import React, { useContext } from 'react'
import Button from '@material-ui/core/Button'
import PropTypes from 'prop-types'
import UserContext, { ProductConsumer } from './Context'

export default function ContextConsumerFunction(propFromContextConsumerFunction) {
  // console.log(propFromContextConsumerFunction)
  // const user = useContext(UserContext)
  // console.log(user)

  return (
    <ProductConsumer>
      {props => {
        // console.log(props.name)
        return (
          <Button variant="contained" color="secondary">
            {props.name}
          </Button>
        )
      }}
    </ProductConsumer>
  )
}

// ContextConsumerFunction.propTypes = {
//   name: PropTypes.node.isRequired,
// }

ContextConsumerFunction.propTypes = {
  name: PropTypes.string,
}

ContextConsumerFunction.defaultProps = {
  name: '',
}
