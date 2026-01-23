document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.getElementById('update-credentials')
    const dataContainer = document.getElementById('credentials-data')
    const cancelBtn = sendBtn.nextElementSibling
    const token = document.querySelector('input[name="csrfmiddlewaretoken"]').value
    const nameSurname = document.querySelector('.name-surname')
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

    inputData.email.addEventListener('input', (e) => checkEmail(e.target))
    
    sendBtn.addEventListener('click', async () => {
        const hasChanges = Object.values(inputData).some(input => input.value !== input.dataset.value)
        if (!hasChanges) {
            cancelBtn.click()
            return
        }

        if (!checkEmail(inputData.email)) {
            return
        }

        const payload = {}
        Object.values(inputData).forEach(input => {
            payload[input.name] = input.value
        })

        const res = await fetch('/profile/update-credentials', {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json', 'X-CSRFToken': token},
            body: JSON.stringify(payload)
        })

        const { success, data } = await res.json()
        if (success) {
            if (data.firstName !== inputData.firstName.dataset.value || data.lastName !== inputData.lastName.dataset.value){
                nameSurname.textContent = data.firstName + ' ' + data.lastName
            }
            Object.entries(data).forEach(([key, value]) => {
                inputData[key].dataset.value = value
            })
            cancelBtn.click()
        } else {
            inputData.email.nextElementSibling.classList.remove('hidden')
            inputData.email.nextElementSibling.textContent = 'Користувач з такою поштою вже існує'
        }
    })
})