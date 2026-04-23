function addMsgToSideChat(data) {
    console.log(data);
    
    const chatContainer = document.querySelector(`.chat[data-id="${data.chatId}"]`)
    console.log(chatContainer);
    if (!chatContainer) return

    const secondBlock = document.getElementById('second-block')
    if (secondBlock && (secondBlock.classList.contains('hidden') || secondBlock.dataset.selected != data.chatId) && !data.isMyMsg) {
        chatContainer.dataset.hasUnread = 'True'
    }
    
    const tempContainer = document.createElement('div')
    tempContainer.innerHTML = data.htmlNotification

    let msgTime = chatContainer.querySelector('.msg-time') 
    if (!msgTime) {
        msgTime = document.createElement('span')
        msgTime.classList.add('msg-time')
        chatContainer.append(msgTime)
    }
    msgTime.textContent = data.msgTime

    let msgText = chatContainer.querySelector('.msg-text')
    if (!msgText) {
        msgText = document.createElement('span')
        msgText.classList.add('msg-text')
        chatContainer.querySelector('.chat-data').append(msgText)
    }
    msgText.textContent = tempContainer.querySelector('.msg-text').textContent

    const parent = chatContainer.parentElement
    chatContainer.remove()
    parent.prepend(chatContainer)    
}