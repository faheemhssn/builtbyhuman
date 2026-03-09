const urlBox = document.getElementById('urlBox')
const scanBtn = document.getElementById('scanBtn')
const warning = document.getElementById('warning')

let currentUrl = null

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0]
  const url = tab?.url

  if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('about:') || url.startsWith('edge://')) {
    urlBox.textContent = 'No scannable page detected'
    urlBox.classList.add('empty')
    warning.style.display = 'block'
    return
  }

  currentUrl = url

  // Truncate display URL if too long
  const displayUrl = url.length > 60 ? url.slice(0, 57) + '...' : url
  urlBox.textContent = displayUrl
  urlBox.title = url

  scanBtn.disabled = false
})

scanBtn.addEventListener('click', () => {
  if (!currentUrl) return

  const scanUrl = `https://builtbyhuman.app/?scan=${encodeURIComponent(currentUrl)}`
  chrome.tabs.create({ url: scanUrl })
  window.close()
})
