function showSpinner(show, container, btnsContainer = null) {
    const loading = container.querySelector('.loading')
    const sendBtn = container.querySelector('.send-btn')
    loading.classList.toggle('hidden', !show)
    sendBtn?.classList.toggle('hidden', show)
    if (btnsContainer) btnsContainer.classList.toggle('hidden', show)
}

function showElementLoading(loadingText) {
    const modal = document.getElementById('element-loading-modal')
    const loading = document.getElementById('element-loading-block')
    const success = document.getElementById('loading-success-block')
    
    loading.querySelector('span').textContent = loadingText
    success.classList.add('hidden')
    loading.classList.remove('hidden')
    modal.classList.remove('hidden')
}

function showElementSuccess(successText) {
    const modal = document.getElementById('element-loading-modal')
    const loading = document.getElementById('element-loading-block')
    const success = document.getElementById('loading-success-block')

    success.querySelector('span').textContent = successText
    success.classList.remove('hidden')
    loading.classList.add('hidden')
    setTimeout(() => {
        modal.classList.add('fade-out')
        modal.addEventListener('transitionend', () => {
            modal.classList.add('hidden')
            modal.classList.remove('fade-out')
        }, { once: true })
    }, 2000)
}

let notificationTimeout = null
let notificationVersion = 0

function showNotification(notification) {
    if (!notification.isRequestNotification) {
        const secondBlock = document.getElementById('second-block') // Перевіряємо, чи невідкритий цей чат
        const selectedChatId = secondBlock?.dataset.selected
        if (secondBlock && !secondBlock.classList.contains('hidden') && Number(selectedChatId) === notification.chatId) return
        else incrementUnreadCount(notification.isGroup ? 'group' : 'chat')
    }
    const modal = document.getElementById('notification-modal')
    modal.classList.remove('fade-out', 'hidden')
    const currentNotificationVersion = ++notificationVersion

    if (notificationTimeout) clearTimeout(notificationTimeout)

    modal.classList.remove('hidden')
    modal.innerHTML = notification.htmlNotification
    notificationTimeout = setTimeout(() => {
        modal.classList.add('fade-out')
        modal.addEventListener('transitionend', () => {
            if(notificationVersion !== currentNotificationVersion) return
            modal.classList.add('hidden')
            modal.classList.remove('fade-out')
        }, { once: true })
    }, 5000)
}