let websocket = null

function connectWS(chatId) {
    if (websocket) websocket.close()
    
    const protocol = window.location.protocol === 'https' ? 'wss' : 'ws'
    const url = `${protocol}://${window.location.host}/chat/${chatId}`
    console.log(url);
    
    websocket = new WebSocket(url)

    websocket.onmessage = async (e) => {        
        const msgsContainer = document.getElementById('msgs-container')
        const data = JSON.parse(e.data)
        const container = document.createElement('div')
        container.innerHTML = data.html
        const hasMsgs = msgsContainer.querySelectorAll('.msg').length > 0
        setDates(container, hasMsgs, msgsContainer.querySelector('.msg-container:last-child .msgx'), 'new')
        msgsContainer.append(...container.children)
        msgsContainer.scrollTop = msgsContainer.scrollHeight
    }
}


const input = document.getElementById('msg-input')
const msgBtn = document.getElementById('send-msg-btn')

msgBtn.addEventListener('click', () => {
    if (!websocket) return

    const value = input.value.trim()
    if (!value) return
    websocket.send(JSON.stringify({ msg: value }))
    input.value = ''
})
