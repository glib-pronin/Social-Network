document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('first-entry-form')
    const modal = form.parentElement
    const token = form.elements.csrfmiddlewaretoken.value
    const generator = document.getElementById('generate-username')
    const inputs = form.querySelectorAll('input')
    const usernameInput = form.elements.username
    
    const url = new URL(location.href)
    url.searchParams.delete('first_entry')
    history.replaceState(null, '', url.toString())

    let isUsernameAvailable = true
    const debounceCheck = debounce(async (input) => {
        isUsernameAvailable = await checkUsername(input)
    }, 500)
    usernameInput.addEventListener('input', () => debounceCheck(usernameInput))
    
    inputs.forEach(input => input.addEventListener('input', () => input.nextElementSibling.classList.add('hidden')))

    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        if (!isUsernameAvailable) return
        const firstName = form.elements.firstName.value
        const lastName = form.elements.lastName.value
        const username = usernameInput.value
        if (!validateUsername(usernameInput)) return
        showSpinner(true, form)
        const res = await fetch('/first-entry', {
            method: 'POST',
            headers: {"Content-Type": "application/json", "X-CSRFToken": token},
            body: JSON.stringify({ firstName, lastName, username })
        })
        showSpinner(false, form)
        const { success } = await res.json()
        if (success) {
            modal.remove()
        } else {
            usernameInput.nextElementSibling.classList.remove('hidden')
            usernameInput.nextElementSibling.textContent = "Таке ім'я користувача вже існує"
        }
    })

    generator.addEventListener('click', async () => {
        const firstName = form.elements.firstName.value
        if (!firstName) {
            form.elements.firstName.nextElementSibling.classList.remove('hidden')
            return
        }
        const lastName = form.elements.lastName.value
        if (!lastName) {
            form.elements.lastName.nextElementSibling.classList.remove('hidden')
            return
        }
        const res = await fetch('/generate-username', {
            method: 'POST',
            headers: {"Content-Type": "application/json", "X-CSRFToken": token},
            body: JSON.stringify({ firstName, lastName })
        })
        const { username } = await res.json()
        usernameInput.value = username
    })

    usernameInput.addEventListener('input', () => handleUsernameInput(usernameInput))
})