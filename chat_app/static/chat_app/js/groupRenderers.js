// Функція рендеру користувачів по групах
function renderLetterGroups(allUsers, fetchData, selectedUsers) {
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
        users.forEach(user => createUser(usersContainer, user, selectedUsers))
        allUsers.append(letterGroup)
    })
}
// Функці рендеру користувача
function createUser(usersContainer, user, selectedUsers, addTrashIcon = false) {
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