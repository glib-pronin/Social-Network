document.addEventListener('DOMContentLoaded', () => {
    const controls = document.getElementById('friendship-controls')
    const profileId = controls.dataset.profileId
    let state = controls.dataset.initialState
    const friendsCountContainer = document.getElementById('friends-count')
    const modal = document.getElementById('confirm-action-modal')
    const modalText = modal.querySelector('p')
    const token = document.querySelector('input[name="csrfmiddlewaretoken"]').value

    function render() {
        controls.classList.remove('hidden')
        const btn1 = document.createElement('button')
        btn1.classList.add('modal-btn', 'btn1')
        const btn2 = document.createElement('button')
        btn2.classList.add('modal-btn', 'btn2')
        controls.innerHTML = ''
        if (state === 'friend') {
            btn1.textContent = 'Повідомлення'
            btn1.id = 'msg-btn'
            btn2.textContent = 'Видалити'
            btn2.id = 'remove-btn'
            controls.append(btn1, btn2)
        } else if (state === 'outgoing') {
            btn2.textContent = 'Скасувати запит'
            btn2.id = 'cancel-btn'
            controls.append(btn2)
        } else if (state === 'incoming') {
            btn1.textContent = 'Прийняти запит'
            btn1.id = 'accept-btn'
            btn2.textContent = 'Відхилити запит'
            btn2.id = 'cancel-btn'
            controls.append(btn1, btn2)
        } else if (state === 'none') {
            btn1.textContent = 'Додати до друзів'
            btn1.id = 'add-btn'
            controls.append(btn1)
        } else {
            controls.classList.add('hidden')
        }
        attachHandlers()
    }

    render()

    function attachHandlers() {
        const addBtn = document.getElementById('add-btn')
        const cancelBtn = document.getElementById('cancel-btn')
        const acceptBtn = document.getElementById('accept-btn')
        const removeBtn = document.getElementById('remove-btn')
        const messageBtn = document.getElementById('msg-btn')

        if (addBtn) addBtn.addEventListener('click', handleAdd)
        if (cancelBtn) cancelBtn.addEventListener('click', handleCancel)
        if (acceptBtn) acceptBtn.addEventListener('click', handleAccept)
        if (removeBtn) removeBtn.addEventListener('click', handleRemove)
        // if (messageBtn) messageBtn.addEventListener('click', handleMessage)
    }

    async function handleAdd (e) {
        e.preventDefault()
        const res = await fetch(`/profile/friends/add-friend/${profileId}`, {
            method: 'POST',
            headers: {'X-CSRFToken': token}
        })
        const { success, msg, friends_count } = await res.json()
        if (success) {
            if (msg === 'created_friend') {
                state = 'friend'
                friendsCountContainer.textContent = friends_count
            }
            else state = 'outgoing'
            render()
        }
    }

    async function handleCancel (e) {
        e.preventDefault()
        modal.classList.remove('hidden')
        modalText.textContent = 'Ви дійсно хочете відхилити запит?'
        modal.callback = async () => {
            const res = await fetch(`/profile/friends/cancel-friend-request/${profileId}`, {
                method: 'POST',
                headers: {'X-CSRFToken': token}
            })
            const { success, request_count } = await res.json()
            if (success) {
                changeRequestCount(request_count)
                state = 'none'
                render()
            }
        }
    }

    async function handleAccept (e) {
        e.preventDefault()
        const res = await fetch(`/profile/friends/accept-friend-request/${profileId}`, {
            method: 'POST',
            headers: {'X-CSRFToken': token}
        })
        const { success, request_count, friends_count } = await res.json()
        
        if (success) {
            friendsCountContainer.textContent = friends_count
            changeRequestCount(request_count)
            state = 'friend'
            render()
        }
    }

    async function handleRemove (e) {
        e.preventDefault()
        modal.classList.remove('hidden')
        modalText.textContent = 'Ви дійсно хочете видалити користувача?'
        modal.callback = async () => {
            const res = await fetch(`/profile/friends/remove-friend/${profileId}`, {
                method: 'POST',
                headers: {'X-CSRFToken': token}
            })
            const { success, friends_count } = await res.json()
            if (success) {
                friendsCountContainer.textContent = friends_count
                state = 'none'
                render()
            }
        }
    }
})