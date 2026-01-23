function handleUsernameInput(usernameInput) {
    let value = usernameInput.value
    value = value.toLowerCase()
    value = value.replaceAll(/[^a-z0-9_.]/g, '')
    usernameInput.value = '@' + value
}

function validateUsername(usernameInput) {
    if (usernameInput.value.trim() === '@' || !usernameInput.value.trim()) {
        usernameInput.nextElementSibling.classList.remove('hidden')
        usernameInput.nextElementSibling.textContent = "Це поле обов'язкове"
        return false
    }
    if (!/^@[a-z0-9]+([_.][a-z0-9]+)*$/.test(usernameInput.value)) {
        usernameInput.nextElementSibling.classList.remove('hidden')
        usernameInput.nextElementSibling.textContent = "Ім'я користувача повинно скалдатися з латинських літер або чисел, а також може містити нижнє підкреслення чи крапку (не в кінці та не напочатку)"
        return false
    }
    return true
}