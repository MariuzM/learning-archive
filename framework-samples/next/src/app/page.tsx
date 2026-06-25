'use client'

import { MapBox } from '../components/MapBox'

export default function Home() {
  return (
    <>
      <div>Hello World</div>
      <MapBox accessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string} />
    </>
  )
}
