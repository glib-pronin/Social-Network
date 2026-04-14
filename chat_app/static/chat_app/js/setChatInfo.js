function setChatInfo(chatBlock, { success, chatName, chatMembersIds, isGroup, chatAvatar, shortName, isAdmin, userId }) {
    if (!success) return

    const chatNameSpan = chatBlock.querySelector('.chat-name')
    chatNameSpan.textContent = chatName
    const img = chatBlock.querySelector('img')
    const span = chatBlock.querySelector('.avatar-default')
    img.src = chatAvatar ?? ''
    span.textContent = shortName
    img.classList.toggle('hidden', !chatAvatar)
    img.parentElement.classList.toggle('user-presence', !isGroup)
    img.parentElement.classList.remove('online')
    span.classList.toggle('hidden', chatAvatar)
    removeIndicator(img.parentElement)

    const menu = chatBlock.closest('.second-block').querySelector('.menu-container')
    const horizontalLine = menu.querySelector('.horizontal-line')
    const editGroup = menu.querySelector('.edit-group')
    const deleteGroup = menu.querySelector('.delete-group')
    const leaveGroup = menu.querySelector('.leave-group')
    horizontalLine.classList.add('hidden')
    editGroup.classList.add('hidden')
    deleteGroup.classList.add('hidden')
    leaveGroup.classList.add('hidden')
    
    const groupCountSpan = document.querySelector('.chat-members-count')
    if (isGroup) {
        groupCountSpan.textContent = setGroupCount(chatMembersIds.length)
        groupCountSpan.dataset.membersIds = chatMembersIds
        horizontalLine.classList.remove('hidden')
        if (isAdmin) {
            editGroup.classList.remove('hidden')
            deleteGroup.classList.remove('hidden')
        } else {
            leaveGroup.classList.remove('hidden')
        }
        setOnlineMembersCount()
    } else {
        groupCountSpan.dataset.membersIds = ''
        groupCountSpan.textContent = ''
        groupCountSpan.nextElementSibling.textContent = ''
        img.parentElement.dataset.id = userId
        registerIndicators(img.parentElement.parentElement)
    }
}

function setGroupCount(count) {
    const lastDigit = count % 10
    const lastTwoDigits = count % 100
    if (lastDigit === 1 && lastTwoDigits !== 11) return count + ' учасник'
    else if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) return count + ' учасники'
    return count + ' учасників'
}   

function setOnlineMembersCount() {
    const welcomeBlock = document.querySelector('.welcome-block')
    const chatHeader = document.querySelector('.chat-header')
    const chatMembersSpan = chatHeader?.querySelector('.chat-members-count')
    if (!chatMembersSpan || !welcomeBlock.classList.contains('hidden') || !chatMembersSpan.textContent) return
    
    const membersIds = chatMembersSpan.dataset.membersIds?.split(',')
    if (!membersIds) return

    let count = 0
    membersIds.forEach(id => {
      if (onlineUsers.has(id)) count++  
    })
    console.log(count)
    const onlineMembersSpan = chatMembersSpan.nextElementSibling
    if (count > 0) onlineMembersSpan.textContent = `, ${count} в мережі`
    else onlineMembersSpan.textContent = ''
}


function updateSideChat({id, chatName, shortName, chatAvatar}) {
    const group = document.querySelector(`.groups-all .chat[data-id="${id}"]`)
    if (!group) return
    group.querySelector('.chat-data span:first-child').textContent = chatName
    let avatarPhoto = group.querySelector('.avatar')
    let avatarDefault = group.querySelector('.avatar-default')
    if (chatAvatar) {
        if (avatarPhoto) avatarPhoto.src = chatAvatar
        else {
            avatarPhoto = document.createElement('img')
            avatarPhoto.classList.add('avatar')
            avatarPhoto.src = chatAvatar
            avatarDefault?.replaceWith(avatarPhoto)
        }
    } else {
        if (avatarDefault) avatarDefault.textContent = shortName
        else {
            avatarDefault = document.createElement('span')
            avatarDefault.classList.add('avatar-default')
            avatarDefault.textContent = shortName
            avatarPhoto?.replaceWith(avatarDefault)
        }
    }
}