function addMsgToSideChat(data) {
    const chatContainer = document.querySelector(`.chat[data-id="${data.chatId}"]`)
    if (!chatContainer) return

    const secondBlock = document.getElementById('second-block')
    if (secondBlock && (secondBlock.classList.contains('hidden') || secondBlock.dataset.selected != data.chatId) && !data.isMyMsg) {
        chatContainer.dataset.hasUnread = 'True'
    }
    
    const tempContainer = document.createElement('div')
    tempContainer.innerHTML = data.htmlNotification

    chatContainer.querySelector('.msg-time').textContent = data.msgTime
    chatContainer.querySelector('.msg-text').textContent = tempContainer.querySelector('.msg-text').textContent

    const parent = chatContainer.parentElement
    chatContainer.remove()
    parent.prepend(chatContainer)    
}