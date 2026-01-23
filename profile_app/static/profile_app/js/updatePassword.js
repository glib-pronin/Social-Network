document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.getElementById('update-password')
    const cancleBtn = sendBtn.nextElementSibling
    const passwordInput = document.getElementById('password')
    const passwordConfirmInput = document.getElementById('confirm-password')
    const successMsg = document.querySelector('.success-msg')
    const token = document.querySelector('input[name="csrfmiddlewaretoken"]').value

    passwordInput.addEventListener('input', () => checkPasswords(passwordConfirmInput, passwordInput))
    passwordInput.addEventListener('input', () => {
        if (passwordInput.value.length < 6) {
            passwordInput.nextElementSibling.classList.remove('hidden')
        } else {
            passwordInput.nextElementSibling.classList.add('hidden')
        }
    })
    passwordConfirmInput.addEventListener('input', () => checkPasswords(passwordConfirmInput, passwordInput))

    sendBtn.addEventListener('click', async () => {
        const password = passwordInput.value
        const confirmPassword = passwordConfirmInput.value
        if (!password || password.length < 6) {
            passwordInput.nextElementSibling.classList.remove('hidden')
            return
        } 
        if (password !== confirmPassword) {
            passwordInput.nextElementSibling.classList.remove('hidden')
            return
        }
        showSpinner(true, sendBtn.parentElement.parentElement)
        sendBtn.parentElement.classList.add('hidden')
        const res = await fetch('/profile/update-password', {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json', 'X-CSRFToken': token},
            body: JSON.stringify({password, confirmPassword})
        })
        showSpinner(false, sendBtn.parentElement.parentElement)
        sendBtn.parentElement.classList.remove('hidden')
        cancleBtn.click()
        successMsg.classList.remove('hidden')
        setTimeout(() => successMsg.classList.add('hidden'), 5000)
    })
})