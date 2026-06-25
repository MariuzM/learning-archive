import React, { Component, useContext } from 'react'
import Button from '@material-ui/core/Button'
import { CreateContext } from './_context'

// ===============================================
// Class base
// ===============================================
// export default class ToggleButton extends Component {
//   static contextType = CreateContext;
//   render() {
//     const { toggleButton } = this.context;
//     return <Button onClick={toggleButton}>Toggle Theme</Button>;
//   }
// }

// ===============================================
// Converted to Function base
// ===============================================
// export default function ToggleButton() {
//   return (
//     <CreateContext.Consumer>
//       {value => {
//         const { toggleButton } = value;
//         return <Button onClick={toggleButton}>Toggle Theme</Button>;
//       }}
//     </CreateContext.Consumer>
//   );
// }

// ===============================================
// Converted to Arrow base
// ===============================================
// const ToggleButton = () => {
//   return (
//     <CreateContext.Consumer>
//       {value => {
//         const { toggleButton } = value;
//         return <Button onClick={toggleButton}>Toggle Theme</Button>;
//       }}
//     </CreateContext.Consumer>
//   );
// };
// export default ToggleButton;

// ===============================================
// Converted to Arrow V2 base
// ===============================================
// const ToggleButton = () => (
//   <CreateContext.Consumer>
//     {value => {
//       const { toggleButton } = value;
//       return <Button onClick={toggleButton}>Toggle Theme</Button>;
//     }}
//   </CreateContext.Consumer>
// );
// export default ToggleButton;

// ===============================================
// Function + Hooks
// ===============================================
export default function ToggleButton() {
  const { toggleButton } = useContext(CreateContext)
  return <Button onClick={toggleButton}>Toggle Theme</Button>
}

// ===============================================
// Arrow + Hooks
// ===============================================
// const ToggleButton = () => {
//   const { toggleButton } = useContext(CreateContext);
//   return <Button onClick={toggleButton}>Toggle Theme</Button>;
// };
// export default ToggleButton;
