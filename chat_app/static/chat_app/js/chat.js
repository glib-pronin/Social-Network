const url = `ws://${window.location.host}/chat/`
const websocket = new WebSocket(url)

websocket.onmessage = async (e) => {
    const data = JSON.parse(e.data)
    if (data.type === 'send_msg') {
        const p = document.createElement('p')
        p.textContent = data.msg
        document.querySelector('main').append(p)
    }
}

const input = document.getElementById('msg-input')
const msgBtn = document.getElementById('msg-send')

msgBtn.addEventListener('click', () => {
    console.log('////');
    const value = input.value
    websocket.send(JSON.stringify({ msg: value }))
    input.value = ''
})