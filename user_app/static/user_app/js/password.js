function checkPasswords(confirmPasswordField, passwordField) {
    if (!confirmPasswordField.value || confirmPasswordField.value === passwordField.value) {
        confirmPasswordField.nextElementSibling.classList.add('hidden')
    } else {
        confirmPasswordField.nextElementSibling.classList.remove('hidden')
    }
}

function validatePassword(password) {
    if (password.length < 8) return 'Пароль має бути не менше 8 символів'
    if (!/[A-Z]/.test(password)) return'Додайте хоча б одну велику латинську літеру'
    if (!/[a-z]/.test(password)) return 'Додайте хоча б одну маленьку латинську літеру'
    if (!/[0-9]/.test(password)) return 'Додайте хоча б одну цифру'
    return null
}

document.addEventListener('DOMContentLoaded', () => {
    const passworfContainers = document.querySelectorAll('.password-container')

    function hidePassword(input, hider, shower) {
        input.type = 'password'
        hider.classList.remove('hidden')
        shower.classList.add('hidden')
    }

    function showPassword(input, hider, shower) {
        if (!input.disabled) {
            input.type = 'text'
            shower.classList.remove('hidden')
            hider.classList.add('hidden')
        }
    }

    function getPasswordContainerElement(passwordContainer) {
        const input = passwordContainer.querySelector('input')
        const hider = passwordContainer.querySelector('.password-hidden')
        const shower = passwordContainer.querySelector('.password-shown')
        return [input, hider, shower]
    }

    passworfContainers.forEach(passwordContainer => {
        const [input, hider, shower] = getPasswordContainerElement(passwordContainer)
        hider.addEventListener('click', () => showPassword(input, hider, shower))
        shower.addEventListener('click', () => hidePassword(input, hider, shower))
    })
})