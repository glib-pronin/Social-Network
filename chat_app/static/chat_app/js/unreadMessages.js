let readTimeout = null

function scheduleRead(chatId) {
    clearTimeout(readTimeout)
    setTimeout(() => sendReadRequest(chatId), 600)
}

async function sendReadRequest(chatId) {
    const token = document.querySelector('input[name="csrfmiddlewaretoken"]')?.value
    const res = await fetch(`/chat/read-chat-messages/${chatId}`, {
        method: 'POST',
        headers: {'X-CSRFToken': token}
    })
    const { success, totalUnread, chatUnread, groupUnread } = await res.json()
    if (success) {
        updateUnreadCount(totalUnread, '.unread-total-count')
        updateUnreadCount(chatUnread, '.unread-chat-count')
        updateUnreadCount(groupUnread, '.unread-group-count')
        const chat = document.querySelector(`.chat[data-id="${chatId}"]`)
        if (chat) chat.dataset.hasUnread = 'False'
    }
}

function updateUnreadCount(count, elementClass) {
    const unreadIndicators = document.querySelectorAll(elementClass)    
    unreadIndicators.forEach(indicator => {
        indicator.textContent = count
        indicator.classList.toggle('hidden', !count)
    })
}

function incrementUnreadCount(chatType) {
    const unreadIndicators = document.querySelectorAll(`.unread-total-count, .unread-${chatType}-count`)
    unreadIndicators.forEach(indicator => {
        indicator.classList.remove('hidden')
        const count = indicator.textContent
        if (count === '9+') return
        if (count === '9') indicator.textContent = '9+'
        else {
            const countInt = Number(count)
            if (!Number.isNaN(countInt)) indicator.textContent = countInt + 1
        }
    })
}