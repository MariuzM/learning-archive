import React, { Component, useContext } from 'react'
import { CreateContext } from './_context'

// ===============================================
// Class base
// ===============================================
// export default class Navbar extends Component {
//   static contextType = CreateContext;
//   render() {
//     const { isLightTheme, light, dark } = this.context;
//     const theme = isLightTheme ? light : dark;
//     return (
//       <nav
//         style={{
//           background: theme.ui,
//           color: theme.syntax
//         }}
//       >
//         <h1>Context App</h1>
//         <ul>
//           <li>Home</li>
//           <li>About</li>
//           <li>Contact</li>
//         </ul>
//       </nav>
//     );
//   }
// }

// ===============================================
// Converted to Context.Consumer
// Also be used to consume multiple _context's
// ===============================================
// export default class Navbar extends Component {
//   render() {
//     return (
//       <_createContext.Consumer>
//         {value => {
//           const { isLightTheme, light, dark } = value;
//           const theme = isLightTheme ? light : dark;
//           return (
//             <nav
//               style={{
//                 background: theme.ui,
//                 color: theme.syntax
//               }}
//             >
//               <h1>Context App</h1>
//               <ul>
//                 <li>Home</li>
//                 <li>About</li>
//                 <li>Contact</li>
//               </ul>
//             </nav>
//           );
//         }}
//       </_createContext.Consumer>
//     );
//   }
// }

// ===============================================
// Converted to function base
// ===============================================
// export default function Navbar() {
//   return (
//     <_createContext.Consumer>
//       {value => {
//         const { isLightTheme, light, dark } = value;
//         const theme = isLightTheme ? light : dark;
//         return (
//           <nav
//             style={{
//               background: theme.ui,
//               color: theme.syntax
//             }}
//           >
//             <h1>Context App</h1>
//             <ul>
//               <li>Home</li>
//               <li>About</li>
//               <li>Contact</li>
//             </ul>
//           </nav>
//         );
//       }}
//     </_createContext.Consumer>
//   );
// }

// ===============================================
// Function + Hooks
// ===============================================
export default function Navbar() {
  const { isLightTheme, light, dark, transition } = useContext(CreateContext)
  const theme = isLightTheme ? light : dark
  return (
    <nav
      style={{
        background: theme.ui,
        color: theme.syntax,
        transition,
      }}
    >
      <h1>Context App</h1>
      <ul>
        <li>Home</li>
        <li>About</li>
        <li>Contact</li>
      </ul>
    </nav>
  )
}
