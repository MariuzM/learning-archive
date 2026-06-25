import mapboxgl from 'mapbox-gl'

import 'mapbox-gl/dist/mapbox-gl.css'

import { useEffect, useRef } from 'react'

export const MapBox = ({ accessToken }: { accessToken: string }) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  useEffect(() => {
    if (map.current || !mapContainer.current) return
    mapboxgl.accessToken = accessToken
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-74.5, 40],
      zoom: 9,
    })
    return () => map.current?.remove()
  }, [accessToken])

  return <div ref={mapContainer} style={{ width: '100%', height: '400px' }} />
}
