const overlayEl = document.createElement('div')
overlayEl.style.position = 'absolute'
overlayEl.style.bottom = '0'
overlayEl.style.left = '0'
overlayEl.style.padding = '1rem'
overlayEl.style.fontFamily = 'Courier New'
overlayEl.style.color = '#ffffff'
overlayEl.style.zIndex = '9999'

export class VampireSurvivorsOverlayManager {
  public reset() {
    if (!document.body.contains(overlayEl)) document.body.appendChild(overlayEl)
    overlayEl.innerHTML = ''
  }

  public addMessage(message: string) {
    const el = document.createElement('div')
    el.textContent = message
    overlayEl.appendChild(el)

    const cb = () => overlayEl.removeChild(el)
    setTimeout(cb, 3000)
  }
}
