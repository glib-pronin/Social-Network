function createChat(chatData, selector) {
    const group = document.createElement('div')
    group.classList.add('chat', 'chat-handler')
    group.dataset.id = chatData.id
    const groupData = document.createElement('div')
    groupData.classList.add('without-time')
    let img
    if (chatData.chatAvatar) {
        img = document.createElement('div')
        img.classList.toggle('user-presence', !chatData.isGroup)
        img.dataset.id = chatData.userId
        im = document.createElement('img')
        im.classList.add('avatar')
        im.src = chatData.chatAvatar
        img.append(im)
    } else {
        img = document.createElement('span')
        img.classList.add('avatar-default')
        img.textContent = chatData.shortName
    }
    const extraContainer = document.createElement('div')
    extraContainer.classList.add('chat-data')
    const span = document.createElement('span')
    span.textContent = chatData.chatName
    extraContainer.append(span)
    groupData.append(img, extraContainer)
    group.append(groupData)
    document.querySelector(selector).prepend(group)
    registerIndicators(group)
    return group
}

document.addEventListener('DOMContentLoaded', () => {
    const openBtns = document.querySelectorAll('.create-group')
    const selectUsersModal = document.getElementById('select-users-for-group-modal')
    const allUsers = selectUsersModal.querySelector('.all-users')
    const selectedUsersCount = document.getElementById('selected-users-count')
    const searchInput = selectUsersModal.querySelector('.search-input')
    const groupModal = document.getElementById('group-modal')
    const token = selectUsersModal?.querySelector('form')?.elements.csrfmiddlewaretoken.value

    let fetchData = {}
    let usersForSearching = []
    let selectedUsers = []
    let mode = 'create'

    openBtns.forEach(btn => btn.addEventListener('click', openSelectModal))
    // Відкриття модалку вибору користувачів
    async function openSelectModal(reset = true) {
        if (reset) {
            resetgroupModal()
            mode = 'create'
            selectUsersModal.querySelector('button[type="submit"]').textContent = 'Далі'
            selectUsersModal.querySelector('.form-text').textContent = 'Нова група'
            selectedUsers = []
        }
        searchInput.value = ''
        const res = await fetch('/chat/get-friends-list')
        fetchData = await res.json()
        usersForSearching = [...Object.values(fetchData.latin).flat(), ...Object.values(fetchData.cyrillic).flat()]
        renderLetterGroups(allUsers, fetchData, selectedUsers)
        selectUsersModal.classList.remove('hidden')
    }
    // Делегація кліку по чекбоксу
    allUsers.addEventListener('change', (e) => {
        const checkBox = e.target.closest('input')
        if (!checkBox) return
        const userId = checkBox.closest('.user').dataset.id
        const user = usersForSearching.find(us => us.id == userId)
        if (user) {
            if (checkBox.checked) selectedUsers.push(user)
            else selectedUsers = selectedUsers.filter(us => us.id != user.id )
        }
        selectedUsersCount.textContent = selectedUsers.length
    })
    //Пошук користувачів 
    const onInput = debounce(() => {
        const value = searchInput.value.trim().toLowerCase()

        if (!value) {
            renderLetterGroups(allUsers, fetchData, selectedUsers)
            return
        }
        allUsers.innerHTML = ''
        usersForSearching.filter(us => {
            if (us.name.toLowerCase().includes(value)) {
                createUser(allUsers, us, selectedUsers)
                return true
            }
        })
    }, 300)
    searchInput.addEventListener('input', onInput)
    // Перехід до модалки створення групи
    selectUsersModal.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault()
        if (selectedUsers.length < 1) {
            showError(selectUsersModal, 'Додайте хоча б одного користувача')
            return
        }
        selectUsersModal.classList.add('hidden')
        openGroupModal(groupModal, selectedUsers, createUser, mode)
    })
    // Повернення до вибору користувачів
    groupModal.querySelector('.back-btn').addEventListener('click', () => {
        if (mode === 'edit') {
            groupModal.classList.add('hidden')
            resetgroupModal()
            return
        }
        const users = allUsers.querySelectorAll('.user')
        users.forEach(el => {
            const checkBox = el.querySelector('input[type="checkbox"]')
            if (!checkBox) return
            checkBox.checked = selectedUsers.some(us => us.id == el.dataset.id)
        })
        selectedUsersCount.textContent = selectedUsers.length
        groupModal.classList.add('hidden')
        selectUsersModal.classList.remove('hidden')
    })
    groupModal.querySelector('.add-user-to-group').addEventListener('click', () => {
        selectUsersModal.querySelector('button[type="submit"]').textContent = 'Зберегти'
        selectUsersModal.querySelector('.form-text').textContent = 'Додати учасника'
        selectedUsersCount.textContent = selectedUsers.length
        groupModal.classList.add('hidden')
        openSelectModal(false)
    })
    // Делегація видалення вибраних користувачів
    groupModal.querySelector('.selected-users-list').addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-user')
        if (!deleteBtn) return
        const user = deleteBtn.closest('.user')
        user.remove()
        selectedUsers = selectedUsers.filter(us => us.id != user.dataset.id )
    })

    const fileInput = document.getElementById('load-group-avatar')
    const fileInputTrigger = document.getElementById('trigger-file-input')
    const groupNameInput = groupModal.querySelector('form').elements.groupName
    const avatarDefault = groupModal.querySelector('.avatar-default')
    const avatarPhoto = groupModal.querySelector('.avatar')
    const avatarOverlay = groupModal.querySelector('.avatar-overlay')
    
    let previewUrl = null
    let avatarFile = null
    let avatarRemoved = false

    groupNameInput.addEventListener('input', () => {
        if (previewUrl) return
        const words = groupNameInput.value.trim().split(' ').filter(Boolean).slice(0, 2)
        let name = ''
        words.forEach(w => name += w[0])
        
        avatarDefault.textContent = name.toUpperCase() ?? ''
    })
    fileInputTrigger.addEventListener('click', () => fileInput.click())
    // Робота з файлуом аватарки
    fileInput.addEventListener('change', () => {
        avatarFile = fileInput.files[0]
        
        if (!avatarFile) return

        if (previewUrl) URL.revokeObjectURL(previewUrl)

        previewUrl = URL.createObjectURL(avatarFile)
        avatarPhoto.src = previewUrl
        avatarRemoved = false
        avatarPhoto.classList.remove('hidden')
        avatarDefault.classList.add('hidden')
    })

    function clearAvatar(removed = false) {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        previewUrl = null
        fileInput.value = ''
        avatarPhoto.src = ''
        avatarFile = null   
        avatarRemoved = removed
        avatarPhoto.classList.add('hidden')
        avatarDefault.classList.remove('hidden')        
    }

    avatarOverlay.addEventListener('click', () => {
        clearAvatar(true)
        groupNameInput.dispatchEvent(new Event('input', {bubbles: true}))   
    })
    // Створення групи
    groupModal.querySelector('form').addEventListener('submit', async (e) => {
        e.preventDefault()

        const groupName = groupNameInput.value.trim()

        if (!groupName || groupName.length < 3) {
            showError(groupModal, 'Введіть назву групи (як мінімум три символи)')
            return
        }
        if (selectedUsers.length < 1) {
            showError(groupModal, 'Додайте хоча б одного користувача')
            return
        }
        showSpinner(true, groupModal, groupModal.querySelector('.btns-container'))
        showElementLoading(mode === 'edit' ? 'Оновлюємо групу' : 'Створюємо групу...')
        const formData = new FormData()
        formData.append('name', groupName)
        selectedUsers.forEach(us => formData.append('users', us.id))

        if (mode === 'create') {
            if (avatarFile) formData.append('avatar', avatarFile)
            const res = await fetch('/chat/create-group', {
                method: 'POST',
                headers: {'X-CSRFToken': token},
                body: formData
            })
            showSpinner(false, groupModal, groupModal.querySelector('.btns-container'))
            showElementSuccess('Групу успішно створено')
            const { success, chatData } = await res.json()
            if (success) {
                resetgroupModal()
                groupModal.classList.add('hidden')
                const group = createChat(chatData, '.groups-all')
                group.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}))
            }
        } else if (mode === 'edit') {
            if (!isEqualData(groupModal.state, {name: groupName, avatar: previewUrl, users: selectedUsers})) {
                if (avatarFile) formData.append('avatar', avatarFile)
                else if (avatarRemoved) formData.append('remove_avatar', '1')
                const res = await fetch(`/chat/edit-group/${groupModal.chatId}`, {
                    method: 'POST',
                    headers: {'X-CSRFToken': token},
                    body: formData
                })
                const { success, chatData } = await res.json() 
                if (success) {
                    setChatInfo(secondBlock.querySelector('.chat-header'), {success, ...chatData})
                    updateSideChat(chatData)
                }
            }
            showSpinner(false, groupModal, groupModal.querySelector('.btns-container'))
            showElementSuccess('Групу успішно змінено')
            resetgroupModal()
            groupModal.classList.add('hidden')
        }
    })
    
    function resetgroupModal() {
        groupNameInput.value = ''
        groupModal.state = null
        groupModal.chatId = null
        clearAvatar()
        avatarDefault.textContent = ''
        selectedUsersCount.textContent = '0'
    }

    const secondBlock = document.querySelector('.second-block')
    secondBlock.addEventListener('click', async (e) => {
        if (!secondBlock.querySelector('.welcome-block').classList.contains('hidden')) return
        const openMenu = e.target.closest('.open-menu')
        if (openMenu) {
            secondBlock.querySelector('.menu-container').classList.remove('hidden')
            return
        }
        const editGroup = e.target.closest('.edit-group')
        if (editGroup) {
            resetgroupModal()
            const chatId = secondBlock.dataset.selected
            groupModal.chatId = chatId
            mode = 'edit'
            groupModal.state = await loadGroupData(chatId)
            selectedUsers = [...groupModal.state.users]
            previewUrl = groupModal.state.avatar
            openGroupModal(groupModal, selectedUsers, createUser, mode, true)
            return
        }
        const leaveGroupBtn = e.target.closest('.leave-group')
        if (leaveGroupBtn) {
            const chatId = secondBlock.dataset.selected
            leaveGroup(chatId, token)
        }
        const deletGroupBtn = e.target.closest('.delete-group')
        if (deletGroupBtn) {
            const chatId = secondBlock.dataset.selected
            deleteGroup(chatId, token)
        }
    })
})