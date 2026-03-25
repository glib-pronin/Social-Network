function createChat(chatData, selector) {
    const group = document.createElement('div')
    group.classList.add('chat', 'chat-handler')
    group.dataset.id = chatData.id
    const groupData = document.createElement('div')
    groupData.classList.add('without-time')
    let img
    if (chatData.chatAvatar) {
        img = document.createElement('img')
        img.classList.add('avatar')
        img.src = chatData.chatAvatar
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
    return group
}

document.addEventListener('DOMContentLoaded', () => {
    const openBtns = document.querySelectorAll('.create-group')
    const selectUsersModal = document.getElementById('select-users-for-group-modal')
    const allUsers = selectUsersModal.querySelector('.all-users')
    const selectedUsersCount = document.getElementById('selected-users-count')
    const searchInput = selectUsersModal.querySelector('.search-input')
    const createGroupModal = document.getElementById('create-group-modal')
    const token = selectUsersModal?.querySelector('form')?.elements.csrfmiddlewaretoken.value

    let fetchData = {}
    let usersForSearching = []
    let selectedUsers = []

    openBtns.forEach(btn => btn.addEventListener('click', openSelectModal))
    // Відкриття модалку вибору користувачів
    async function openSelectModal() {
        resetCreateGroupModal()
        selectedUsers = []
        const res = await fetch('/chat/get-friends-list')
        fetchData = await res.json()
        usersForSearching = [...Object.values(fetchData.latin).flat(), ...Object.values(fetchData.cyrillic).flat()]
        renderLetterGroups()
        selectUsersModal.classList.remove('hidden')
    }
    // Функція рендеру користувачів по групах
    function renderLetterGroups() {
        allUsers.innerHTML = ''
        const combined = {
            ...fetchData.latin,
            ...fetchData.cyrillic
        }
        Object.entries(combined).forEach(([letter, users]) => {
            const letterGroup = document.createElement('div')
            letterGroup.classList.add('letter-group')
            const spanLetter = document.createElement('span')
            spanLetter.classList.add('letter')
            spanLetter.textContent = letter
            const usersContainer = document.createElement('div')
            usersContainer.classList.add('users')
            letterGroup.append(spanLetter, usersContainer)
            users.forEach(user => createUser(usersContainer, user))
            allUsers.append(letterGroup)
        })
    }
    // Функці рендеру користувача
    function createUser(usersContainer, user, addTrashIcon = false) {
        const userContainer = document.createElement('div')
        userContainer.classList.add('user')
        userContainer.classList.toggle('without-borders', addTrashIcon)
        userContainer.dataset.id = user.id

        const userData =  document.createElement('div')
        userData.classList.add('without-time')
        const img = document.createElement('img')
        img.src = user.avatar
        img.classList.add('avatar')
        const spanName = document.createElement('span')
        spanName.textContent = user.name
        userData.append(img, spanName)
        
        let additionEl
        if (!addTrashIcon) {
            additionEl = document.createElement('input')
            additionEl.type = 'checkbox'
            additionEl.checked = selectedUsers.some(us => us.id == user.id)
        } else {
            additionEl = createTrashIcon()
            additionEl.classList.add('delete-user')
        }

        userContainer.append(userData, additionEl)
        usersContainer.append(userContainer)
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
            renderLetterGroups()
            return
        }
        allUsers.innerHTML = ''
        usersForSearching.filter(us => {
            if (us.name.toLowerCase().includes(value)) {
                createUser(allUsers, us)
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
        const container = createGroupModal.querySelector('.selected-users-list')
        container.innerHTML = ''
        selectedUsers.forEach(us => createUser(container, us, true))
        selectUsersModal.classList.add('hidden')
        createGroupModal.classList.remove('hidden')
    })
    // Повернення до вибору користувачів
    createGroupModal.querySelector('.back-btn').addEventListener('click', () => {
        const users = allUsers.querySelectorAll('.user')
        users.forEach(el => {
            const checkBox = el.querySelector('input[type="checkbox"]')
            if (!checkBox) return
            checkBox.checked = selectedUsers.some(us => us.id == el.dataset.id)
        })
        selectedUsersCount.textContent = selectedUsers.length
        createGroupModal.classList.add('hidden')
        selectUsersModal.classList.remove('hidden')
    })
    // Делегація видалення вибраних користувачів
    createGroupModal.querySelector('.selected-users-list').addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-user')
        if (!deleteBtn) return
        const user = deleteBtn.closest('.user')
        user.remove()
        selectedUsers = selectedUsers.filter(us => us.id != user.dataset.id )
    })

    const fileInput = document.getElementById('load-group-avatar')
    const fileInputTrigger = document.getElementById('trigger-file-input')
    const groupNameInput = createGroupModal.querySelector('form').elements.groupName
    const avatarDefault = createGroupModal.querySelector('.avatar-default')
    const avatarPhoto = createGroupModal.querySelector('.avatar')
    
    let previewUrl = null
    let avatarFile = null

    groupNameInput.addEventListener('input', () => {
        if (previewUrl) return
        const words = groupNameInput.value.trim().split(' ').filter(Boolean).slice(0, 2)
        let name = ''
        words.forEach(w => name += w[0])
        
        avatarDefault.textContent = name.toUpperCase() ?? ''
    })
    fileInputTrigger.addEventListener('click', () => fileInput.click())
    // Вибір файлу
    fileInput.addEventListener('change', () => {
        avatarFile = fileInput.files[0]
        
        if (!avatarFile) return

        if (previewUrl) URL.revokeObjectURL(previewUrl)

        previewUrl = URL.createObjectURL(avatarFile)
        avatarPhoto.src = previewUrl
        avatarPhoto.classList.remove('hidden')
        avatarDefault.classList.add('hidden')
    })
    // Створення групи
    createGroupModal.querySelector('form').addEventListener('submit', async (e) => {
        e.preventDefault()

        const groupName = groupNameInput.value.trim()

        if (!groupName || groupName.length < 3) {
            showError(createGroupModal, 'Введіть назву групи (як мінімум три символи)')
            return
        }
        if (selectedUsers.length < 1) {
            showError(createGroupModal, 'Додайте хоча б одного користувача')
            return
        }
        showSpinner(true, createGroupModal, createGroupModal.querySelector('.btns-container'))
        showElementLoading('Створюємо групу...')
        const formData = new FormData()
        formData.append('name', groupName)
        if (avatarFile) {
            formData.append('avatar', avatarFile)
        }
        selectedUsers.forEach(us => formData.append('users', us.id))
        const res = await fetch('/chat/create-group', {
            method: 'POST',
            headers: {'X-CSRFToken': token},
            body: formData
        })
        showSpinner(false, createGroupModal, createGroupModal.querySelector('.btns-container'))
        showElementSuccess('Групу успішно створено')
        const { success, chatData } = await res.json()
        console.log(success);
        
        if (success) {
            resetCreateGroupModal()
            createGroupModal.classList.add('hidden')
            const group = createChat(chatData, '.groups-all')
            const event = new MouseEvent('click', {
                bubbles: true,
                cancelable: true
            })
            group.dispatchEvent(event)
        }
    })

    function resetCreateGroupModal() {
        avatarPhoto.classList.add('hidden')
        avatarDefault.classList.remove('hidden')
        groupNameInput.value = ''
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        previewUrl = null
        fileInput.value = ''
        avatarPhoto.src = ''
        avatarFile = null
        avatarDefault.textContent = ''
        selectedUsersCount.textContent = '0'
    }
})