import { video, animation, infographic, webinar, white, black } from '../styles/App.css'

type Color = { backgroundColor: string; color: string }

export const colorPickerPrimary = (filter: string): Color => {
  if (filter === 'filter 1') return { backgroundColor: white, color: webinar }
  if (filter === 'filter 2') return { backgroundColor: white, color: infographic }
  if (filter === 'filter 3') return { backgroundColor: white, color: animation }
  if (filter === 'filter 4') return { backgroundColor: white, color: video }
  return { backgroundColor: white, color: black }
}

export const colorPickerSecondary = (filter: string): Color => {
  if (filter === 'filter 1') return { backgroundColor: webinar, color: black }
  if (filter === 'filter 2') return { backgroundColor: infographic, color: white }
  if (filter === 'filter 3') return { backgroundColor: animation, color: white }
  if (filter === 'filter 4') return { backgroundColor: video, color: white }
  return { backgroundColor: black, color: white }
}
