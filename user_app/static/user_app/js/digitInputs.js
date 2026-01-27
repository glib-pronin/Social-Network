document.addEventListener('DOMContentLoaded', () => {
    const digitInputs = document.querySelectorAll('.digit')
    const emailForm = document.getElementById('verify-email')
    const form = document.getElementById('auth-form')
    const token = document.getElementById('auth-form')?.elements.csrfmiddlewaretoken.value

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

    emailForm?.addEventListener('submit', async (e) => {
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
            sessionStorage.removeItem('verify-email')
            location.href = '/?first_entry=true'            
        } else if (error === 'wrong_code') {
            showError('Неправильний код або закінчився його термін придатності')
        } else {
            showError('Сталася помилка, спробуйте пізніше')
        }
    })

    emailForm?.querySelector('.back-btn').addEventListener('click', () => {
        form.classList.remove('hidden')
        emailForm.classList.add('hidden')
        showSpinner(false, emailForm)
        emailForm.querySelector('.error-msg').classList.add('hidden')
        sessionStorage.removeItem('verify-email')
        digitInputs.forEach(inp=>inp.value='')
    })
})