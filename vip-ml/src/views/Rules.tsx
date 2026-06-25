import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import ListGroup from 'react-bootstrap/ListGroup'

export default function App(): JSX.Element {
  return (
    <div>
      <ListGroup>
        <ListGroup.Item>1. I grupe neįleidžiami “įmonių” profiliai.</ListGroup.Item>
        <ListGroup.Item>2. Negalima reklamuoti cigarečių/alkoholio pardavimu.</ListGroup.Item>
        <ListGroup.Item>
          3. Savo paslaugų ar įmonių postai reklamuojami tik vieną kartą, tada naudojant komentarų
          sekcija įrašote kokios akcijos vyksta ar kita kas gali būti svarbu.
        </ListGroup.Item>
        <ListGroup.Item>
          4. Reklamas negalima specialiai iškelti (arba kaip Dj Gedas pasakytu
          “neturbinti/netiuninguoti”), t.y. naudojant: up, taškus, kablelius.
        </ListGroup.Item>
        <ListGroup.Item>
          5. Postai kurie pvz. siūlo darbą iš namų be jokio paaiškinimo kas tai per darbas bus
          trinami. Čia tam kad negaišinti žmonių laiko su „Parašiau i PM“.
        </ListGroup.Item>
      </ListGroup>
    </div>
  )
}
