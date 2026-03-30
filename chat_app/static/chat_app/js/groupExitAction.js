console.log('test');

function leaveGroup(chatId, token) {
    const modal = document.getElementById('confirm-action-modal')
    modal.querySelector('p').textContent = 'Ви дійсно хочете покинути групу?'
    modal.classList.remove('hidden')
    modal.callback = async () => {
        closeWS()
        removeChatFromUI(chatId)
        modal.classList.add('hidden')
        await fetch(`/chat/leave-group/${chatId}`, {
            method: 'POST',
            headers: {'X-CSRFToken': token}
        })
    }
}

function deleteGroup(chatId, token) {
    const modal = document.getElementById('confirm-action-modal')
    modal.querySelector('p').textContent = 'Ви дійсно хочете видалити групу?'
    modal.classList.remove('hidden')
    modal.callback = async () => {
        closeWS()
        removeChatFromUI(chatId)
        modal.classList.add('hidden')
        await fetch(`/chat/delete-group/${chatId}`, {
            method: 'POST',
            headers: {'X-CSRFToken': token}
        })
    }
}

function removeChatFromUI(chatId) {
    const chat = document.querySelector(`.chat[data-id="${chatId}"]`)
    chat?.remove()
    
    const secondBlock = document.querySelector('.second-block')
    if (secondBlock?.dataset.selected == chatId) {
        const backBtn = document.querySelector('.back-btn')
        backBtn.dispatchEvent(new Event('click', {bubbles: true}))
    }
}