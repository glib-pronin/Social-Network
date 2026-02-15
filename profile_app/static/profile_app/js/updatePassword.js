document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.getElementById('update-password')
    const cancleBtn = sendBtn.nextElementSibling
    const passwordInput = document.getElementById('password')
    const passwordConfirmInput = document.getElementById('confirm-password')
    const oldPasswordInput = document.getElementById('old-password')
    const successMsg = passwordInput.parentElement.parentElement.querySelector('.success-msg')
    
    const token = document.querySelector('input[name="csrfmiddlewaretoken"]').value

    oldPasswordInput.addEventListener('input', () => oldPasswordInput.nextElementSibling.classList.add('hidden'))
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
        const oldPassword = oldPasswordInput.value
        const password = passwordInput.value
        const confirmPassword = passwordConfirmInput.value
        if (!oldPassword.trim()) {
            oldPasswordInput.nextElementSibling.classList.remove('hidden')
            oldPasswordInput.nextElementSibling.textContent = 'Введіть поточний пароль'
            return
        }
        if (!password.trim() || password.length < 6) {
            passwordInput.nextElementSibling.classList.remove('hidden')
            return
        } 
        if (password.trim() !== confirmPassword.trim()) {
            passwordInput.nextElementSibling.classList.remove('hidden')
            return
        }
        showSpinner(true, sendBtn.parentElement.parentElement)
        sendBtn.parentElement.classList.add('hidden')
        const res = await fetch('/profile/update-password', {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json', 'X-CSRFToken': token},
            body: JSON.stringify({password, confirmPassword, oldPassword})
        })
        const { success } = await res.json()
        showSpinner(false, sendBtn.parentElement.parentElement)
        sendBtn.parentElement.classList.remove('hidden')
        if (!success) {
            oldPasswordInput.nextElementSibling.classList.remove('hidden')
            oldPasswordInput.nextElementSibling.textContent = 'Неправильний поточний пароль'
            return
        }
        cancleBtn.click()
        successMsg.classList.remove('hidden')
        setTimeout(() => successMsg.classList.add('hidden'), 5000)
    })
})