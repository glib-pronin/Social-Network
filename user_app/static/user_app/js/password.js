document.addEventListener('DOMContentLoaded', () => {
    const passworfContainers = document.querySelectorAll('.password-container')

    function showPassword(input, hider, shower) {
        input.type = 'password'
        hider.classList.remove('hidden')
        shower.classList.add('hidden')
    }

    function hidePassword(input, hider, shower) {
        input.type = 'text'
        shower.classList.remove('hidden')
        hider.classList.add('hidden')
    }

    function getPasswordContainerElement(passwordContainer) {
        const input = passwordContainer.querySelector('input')
        const hider = passwordContainer.querySelector('.password-hidden')
        const shower = passwordContainer.querySelector('.password-shown')
        return [input, hider, shower]
    }

    passworfContainers.forEach(passwordContainer => {
        const [input, hider, shower] = getPasswordContainerElement(passwordContainer)
        hider.addEventListener('click', () => hidePassword(input, hider, shower))
        shower.addEventListener('click', () => showPassword(input, hider, shower))
    })
})