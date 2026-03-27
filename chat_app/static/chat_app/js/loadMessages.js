let messagesCursor = null
let hasNewMessages = null

function setMsgLoader(container) {
    const loader = document.createElement('div')
    loader.id = 'messages-loader'
    container.prepend(loader)
    return loader
}

function setMessagesObserver(loader, cursor, hasNew) {
    messagesCursor = cursor
    hasNewMessages = hasNew
    const observer = new IntersectionObserver(async (entries) => {
        const entry = entries[0]
        if (!entry.isIntersecting) return
        
        const chatBody = loader.closest('.chat-body')
        if(!hasNewMessages) {
            disconnectObserver(observer, loader, chatBody)
            return
        }
        const chatId = loader.closest('.second-block').dataset.selected
        const res = await fetch(`/chat/get-messages/${chatId}?cursor=${messagesCursor}`)
        const data = await res.json()
        const temp = document.createElement('div')
        temp.innerHTML = data.html 
        const container = document.createDocumentFragment()
        container.append(...temp.children)
        messagesCursor = data.cursor
        hasNewMessages = data.hasNext
        const oldHeight = chatBody.scrollHeight
        console.log(oldHeight);
        
        setDates(container, hasNewMessages, chatBody.querySelector('.msg'))
        chatBody.insertBefore(container, loader.nextElementSibling)
        const newHeight = chatBody.scrollHeight
        console.log(newHeight);
        
        chatBody.scrollTop += (newHeight - oldHeight)
        console.log(chatBody.scrollTop);
        
        if(!hasNewMessages) {
            disconnectObserver(observer, loader, chatBody)
            return
        }
    })    
    observer.observe(loader)
    return observer
}

function disconnectObserver(observer, loader, chatBody) {
    console.log('No more messages')
    loader.remove()    
    observer.disconnect()
}