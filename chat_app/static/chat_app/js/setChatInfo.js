function setChatInfo(chatBlock, { success, chatName, chatMembersCount, isGroup, chatAvatar, shortName }) {
    if (!success) return

    const chatNameSpan = chatBlock.querySelector('.chat-name')
    chatNameSpan.textContent = chatName
    const img = chatBlock.querySelector('img')
    const span = chatBlock.querySelector('.avatar-default')
    img.src = chatAvatar ?? ''
    span.textContent = shortName
    img.classList.toggle('hidden', !chatAvatar)
    span.classList.toggle('hidden', chatAvatar)
    if (isGroup) {
        chatNameSpan.nextElementSibling.textContent = setGroupCount(chatMembersCount)
    }
}

function setGroupCount(count) {
    const lastDigit = count % 10
    const lastTwoDigits = count % 100
    if (lastDigit === 1 && lastTwoDigits !== 11) return count + ' учасник'
    else if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) return count + ' учасники'
    return count + ' учасників'
}   


