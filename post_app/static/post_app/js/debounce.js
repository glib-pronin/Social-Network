function debounce(func, delay) {
    let timeout

    return (...args) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), delay)
    }
}

async function checkUsername(usernameInput) {
    const res = await fetch(`/profile/settings/username-available?username=${usernameInput.value}`)
    const { available } = await res.json()
    if (!available) {
        usernameInput.nextElementSibling.classList.remove('hidden')
        usernameInput.nextElementSibling.textContent = "Таке ім'я користувача вже існує"
    } else {
        usernameInput.nextElementSibling.classList.add('hidden')
    }
    return available
}