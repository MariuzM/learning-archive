## QA

1. Pure component does shallow comparison on state change

2.

3. Parent component sends data to child component via props, usually its called prop drilling.
   Another way is to have a global state management like Redux or Context API.

4. React.memo and ref to avoid re-rendering.

5. A fragment groups elements without adding extra nodes to the DOM, might break your app if you are
   using a map function and you are not returning a unique key for each element.

6. State management, auth, error handling.

7.

8. setState takes two args, the first one is the state and the second one is a callback function.
   Async because of performance reasons and to avoid re-rendering, its batching the state updates.
   Also it should help with race conditions.

9. This is hard to explain class to function migration, so in summary function wont have classes,
   constructors, lifecycle methods, and this keyword. All this will be replaced by hooks.

10. - Inline styles where you write `<div style={componentStyle}`

    - CSS Modules where you write `<div className={styles.component}` and import module.css file

    - Styled Components where you write `<Component />` and import styled from styled-components

    - CSS-in-JS where you write `<div className={componentStyle}` and import css from
      'styled-jsx/css'

11. Usually with dangerouslySetInnerHTML but there is security risks.
