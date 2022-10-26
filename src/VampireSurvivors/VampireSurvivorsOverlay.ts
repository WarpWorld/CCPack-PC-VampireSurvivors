const overlayEl = document.createElement('div')
overlayEl.style.position = 'absolute'
overlayEl.style.bottom = '0'
overlayEl.style.left = '0'
overlayEl.style.padding = '1rem'
overlayEl.style.fontFamily = 'Courier New'
overlayEl.style.color = '#ffffff'
overlayEl.style.zIndex = '9999'

export const initOverlay = () => {
  if (!document.body.contains(overlayEl)) document.body.appendChild(overlayEl)
  overlayEl.innerHTML = ''
}

const timeoutIDs: ReturnType<typeof setTimeout>[] = []
export const addToOverlay = (text: string) => {
  const el = document.createElement('div')
  el.textContent = text
  overlayEl.appendChild(el)

  const id = setTimeout(() => overlayEl.removeChild(el), 3000)
  timeoutIDs.push(id)
}
