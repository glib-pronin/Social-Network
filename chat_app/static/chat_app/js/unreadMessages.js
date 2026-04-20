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
    const { success, totalUnread } = await res.json()
    if (success) {
        updateUnreadCount(totalUnread)
    }
}

function updateUnreadCount(totalUnread) {
    const unreadIndicators = document.querySelectorAll('.unread-count')
    unreadIndicators.forEach(indicator => {
        indicator.textContent = totalUnread
        indicator.classList.toggle('hidden', !totalUnread)
    })
}

function incrementUnreadCount() {
    const unreadIndicators = document.querySelectorAll('.unread-count')
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