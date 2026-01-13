document.addEventListener('DOMContentLoaded', () => {
    const digitInputs = document.querySelectorAll('.digit')
    const emailForm = document.getElementById('verify-email')
    const errorContainer = emailForm.querySelector('.error-msg')
    const token = document.getElementById('auth-form').elements.csrfmiddlewaretoken.value

    digitInputs.forEach((digitInput, ind) => {
        digitInput.addEventListener('input', () => {
            digitInput.value = digitInput.value.replace(/\D/g, '')
            if (digitInput.value && ind < digitInputs.length - 1) {
                digitInputs[ind+1].focus()
            }
        })
        
        digitInput.addEventListener('keydown', (e) => {
            if (e.key === "Backspace" && !digitInput.value && ind > 0) {
                digitInputs[ind-1].focus()
                e.preventDefault()
            } else if (e.key === "ArrowLeft" && ind > 0) {
                digitInputs[ind-1].focus()
            } else if (e.key === "ArrowRight" && ind < digitInputs.length - 1) {
                digitInputs[ind+1].focus()
            } 
        })
    })

    function showError(msg, show=false) {
        errorContainer.textContent = msg
        errorContainer.classList.toggle('hidden', show)
    }

    emailForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        let code = ''
        digitInputs.forEach(input => code += input.value)
        if (code.length < 6) {
            showError('Введіть код')
            return
        }
        showSpinner(true, emailForm)
        showError('', true)
        const res = await fetch('/verify-email', {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'X-CSRFToken': token},
            body: JSON.stringify({ code })
        })
        const { success, error } = await res.json()
        showSpinner(false, emailForm)
        if (success) {
            location.href = '/registration'
        } else if (error === 'wrong_code') {
            showError('Неправильний код')
        } else {
            showError('Сталася помилка, спробуйте пізніше')
        }
    })
})