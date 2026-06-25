import { createFileRoute } from '@tanstack/react-router'

import { MapBox } from '../components/MapBox'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <>
      <div>Hello World</div>
      <MapBox accessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string} />
    </>
  )
}
