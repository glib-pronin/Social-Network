const urlsParts = window.location.url.split('/')
const url = `ws://${window.location.host}/chat/${urlsParts[urlsParts.length-1]}`
const websocket = new WebSocket(url)

websocket.onmessage = async (e) => {
}

const input = document.getElementById('msg-input')
const msgBtn = document.getElementById('msg-send')

msgBtn.addEventListener('click', () => {
    const value = input.value
    websocket.send(JSON.stringify({ msg: value }))
    input.value = ''
})