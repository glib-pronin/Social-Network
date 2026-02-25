document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.getElementById('update-credentials')
    const dataContainer = document.getElementById('credentials-data')
    const cancelBtn = sendBtn.nextElementSibling
    const token = document.querySelector('input[name="csrfmiddlewaretoken"]').value
    const nameSurname = document.querySelector('.name-surname')
    const textSignature = document.getElementById('text-signature')
    const startVerifingBtn = document.getElementById('start-verifing')
    const successVerifing = document.getElementById('success-verifing')
    const modal = document.getElementById('verify-email-modal')
    const verifyForm = modal.querySelector('form')

    let verificationActive = false
    let emailVerified = false
    const inputData = {}
    dataContainer.querySelectorAll('input').forEach(input => {
        inputData[input.name] = input
    })
    
    function checkEmail(email) {
        if (!email.value || !/^[a-zA-Z0-9+_%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.value)){
            email.nextElementSibling.classList.remove('hidden')
            email.nextElementSibling.textContent = 'Неправильний формат електронної пошти'
            return false
        }
        email.nextElementSibling.classList.add('hidden')
        return true
    }

    async function cancelVerification() {
        await fetch('/profile/settings/email-verification/cancel', { method: 'POST', headers: { 'X-CSRFToken': token} })
        emailVerified = false
        verificationActive = false
    }

    inputData.email.addEventListener('input', (e) => checkEmail(e.target))
    inputData.email.addEventListener('input', (e) => {
        if (verificationActive) cancelVerification()
        startVerifingBtn.classList.toggle('hidden', !checkEmail(e.target))
    })
    
    sendBtn.addEventListener('click', async () => {
        const hasChanges = Object.values(inputData).some(input => input.value !== input.dataset.value)
        if (!hasChanges) {
            cancelBtn.click()
            return
        }

        if (!emailVerified && inputData.email.value !== inputData.email.dataset.value) {
            inputData.email.nextElementSibling.classList.remove('hidden')
            inputData.email.nextElementSibling.textContent = 'Підтвердіть пошту'
            return
        }

        const payload = {}
        Object.values(inputData).forEach(input => {
            payload[input.name] = input.value
        })

        const res = await fetch('/profile/settings/update-credentials', {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json', 'X-CSRFToken': token},
            body: JSON.stringify(payload)
        })

        const { data } = await res.json()
        if (data.firstName !== inputData.firstName.dataset.value || data.lastName !== inputData.lastName.dataset.value){
            nameSurname.textContent = data.firstName + ' ' + data.lastName
            textSignature.textContent = data.firstName + ' ' + data.lastName
        }
        Object.entries(data).forEach(([key, value]) => {
            inputData[key].dataset.value = value
        })
        cancelBtn.click()
    })

    cancelBtn.addEventListener('click', async () => {
        if (verificationActive || emailVerified) cancelVerification()
        startVerifingBtn.classList.add('hidden') 
        successVerifing.classList.add('hidden')
    })

    startVerifingBtn.addEventListener('click', async () => {
        if (!checkEmail(inputData.email)) return
        successVerifing.classList.add('hidden')
        showSpinner(true, startVerifingBtn.parentElement)
        const res = await fetch('/profile/settings/email-verification/start', {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'X-CSRFToken': token},
            body: JSON.stringify({email: inputData.email.value.trim()})
        })
        showSpinner(false, startVerifingBtn.parentElement)
        const { success, error, email } = await res.json()
        if (success) {
            verificationActive = true
            emailVerified = false
            modal.querySelector('.user-email').textContent = email
            modal.classList.remove('hidden')
            verifyForm.querySelectorAll('.digit').forEach(input => input.value = '')
            showError('', false)
        } else {
            successVerifing.classList.remove('hidden')
            if (error === 'email_exists') {
                inputData.email.nextElementSibling.classList.remove('hidden')
                inputData.email.nextElementSibling.textContent = 'Користувач з такою поштою вже існує'
            } else {
                inputData.email.nextElementSibling.classList.remove('hidden')
                inputData.email.nextElementSibling.textContent = 'Сталася помилка, спробуйте пізніше'
            }
        }
    })

    verifyForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        let code = ''
        verifyForm.querySelectorAll('.digit').forEach(input => code += input.value)
        if (code.length < 6) {
            showError('Введіть код')
            return
        }   
        showSpinner(true, verifyForm)
        const res = await fetch('/profile/settings/email-verification/verify', {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'X-CSRFToken': token},
            body: JSON.stringify({code})
        })
        showSpinner(false, verifyForm)
        const { success, error, email } = await res.json()
        if (success) {
            modal.classList.add('hidden')   
            emailVerified = true
            verificationActive = false
            successVerifing.classList.remove('hidden')
            successVerifing.querySelector('.user-email').textContent = email
            startVerifingBtn.classList.add('hidden') 
        } else if (error === 'wrong_code') {
            showError('Неправильний код або закінчився його термін придатності')
        } else {
            showError('Сталася помилка, спробуйте пізніше')
        }
    })

    function showError(msg, show=true) {
        const errorContainer = verifyForm.querySelector('.error-msg')
        errorContainer.textContent = msg
        errorContainer.classList.toggle('hidden', !show)
    }

})