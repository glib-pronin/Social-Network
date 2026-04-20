let websocket = null

function connectWS(chatId) {
    if (websocket) websocket.close()
    
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const url = `${protocol}://${window.location.host}/chat/${chatId}`
    websocket = new WebSocket(url)

    websocket.onmessage = async (e) => {        
        const msgsContainer = document.getElementById('msgs-container')
        const data = JSON.parse(e.data)
        if (data.tempId) {
            if (!data.isMine) {
                const chatId = msgsContainer.parentElement.dataset.selected
                scheduleRead(chatId)
            }
            const tempMsg = document.querySelector(`.my-msg[data-temp-id="${data.tempId}"]`)
            if (tempMsg) {
                const container = document.createElement('div')
                container.innerHTML = data.html
                tempMsg.closest('.msg-container').replaceWith(...container.children)
                initLightBox()
                return
            }
        }
        setMessage(data, msgsContainer)
        initLightBox()
    }
}

function closeWS() {
    if (websocket) {
        websocket.close()
        websocket = null
    }
}


const input = document.getElementById('msg-input')
const msgBtn = document.getElementById('send-msg-btn')

msgBtn.addEventListener('click', async () => {
    if (!websocket) return

    const value = input.value.trim()
    const secondBlock = input.closest('.second-block')
    const msgsContainer = secondBlock.querySelector('.chat-body')
    const hasImages = secondBlock.hasImages?.()

    if (!value && !hasImages) return

    const tempId = 'temp-' + Date.now()
    const imgsCopy = Array.from(document.querySelectorAll('.img-container:not(.add-more)')).map(el => ({...el.imgObj}))
    const tempEl = createTempMsg({ text: value, images: imgsCopy, tempId }) 
    setMessage({}, msgsContainer, tempEl)
    secondBlock.resetSelectedImages()
    
    const uploadedImages = hasImages ? await secondBlock.uploadImages(imgsCopy) : []

    websocket.send(JSON.stringify({ msg: value, images: uploadedImages, tempId }))
    
    onMessageInput.cancel()
    const data = getMessagesFromStorage()
    const id = input.closest('.second-block').dataset.selected
    delete data[id]
    saveMessagesToStorage(data)
    input.value = ''
})

function setMessage(data, msgsContainer, tempEl = null) {
    const container = document.createElement('div')
    if (tempEl) container.append(tempEl)
    else container.innerHTML = data.html
    const hasMsgs = msgsContainer.querySelectorAll('.msg').length > 0
    setDates(container, hasMsgs, msgsContainer.querySelector('.msg-container:last-child .msg'), 'new')
    msgsContainer.append(...container.children)
    msgsContainer.scrollTop = msgsContainer.scrollHeight
}

function getMessagesFromStorage() {
    const data = localStorage.getItem('messages')
    return JSON.parse(data) ?? {}
}

function saveMessagesToStorage(data) {
    localStorage.setItem('messages', JSON.stringify(data))
}

const onMessageInput = debounce(() => {
    const value = input.value.trim().toLowerCase()
    const id = input.closest('.second-block').dataset.selected
    const messages = getMessagesFromStorage()
    messages[id] = value
    saveMessagesToStorage(messages)
}, 500)

input.addEventListener('input', onMessageInput)