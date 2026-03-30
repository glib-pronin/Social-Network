async function loadGroupData(chatId) {
    const res = await fetch(`/chat/get-group-data/${chatId}`)
    const data = await res.json()
    if (!data.success) return

    return {
        name: data.name,
        avatar: data.avatar,
        users: data.users
    }
}

function openGroupModal(groupModal, selectedUsers, createUser, mode, setData = false) {
    const container = groupModal.querySelector('.selected-users-list')
    container.innerHTML = ''
    selectedUsers.forEach(us => createUser(container, us, selectedUsers, true))
    groupModal.classList.remove('hidden')

    const addUser = groupModal.querySelector('.add-user-to-group')
    const modalHeader = groupModal.querySelector('.form-text')
    const btn = groupModal.querySelector('button[type="submit"]')
    
    addUser.classList.toggle('hidden', mode === 'create')
    modalHeader.textContent = mode === 'create' ? 'Нова група' : 'Редагування групи'
    btn.textContent = mode === 'create' ? 'Створити групу' : 'Зберегти зміни'
    container.parentElement.classList.toggle('with-border', mode === 'edit')

    if (mode === 'edit' && setData) {
        const input = groupModal.querySelector('form').elements.groupName
        const avatarPhoto = groupModal.querySelector('.avatar')
        input.value = groupModal.state.name
        if (groupModal.state.avatar) {
            avatarPhoto.src = groupModal.state.avatar
            avatarPhoto.classList.remove('hidden')
            groupModal.querySelector('.avatar-default').classList.add('hidden')
        } else {
            input.dispatchEvent(new Event('input', { bubbles: true }))
        }
    }
}

function isEqualData(originalState, newState) {
    if (originalState.name !== newState.name) return false
    if (originalState.avatar !== newState.avatar) return false
    const oldUsers = originalState.users.map(us => +us.id).sort((a, b) => a - b).join(',')
    const newUsers = newState.users.map(us => +us.id).sort((a, b) => a - b).join(',')
    console.log(oldUsers, newUsers);
    
    return oldUsers === newUsers
}