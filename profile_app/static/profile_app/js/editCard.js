document.addEventListener('DOMContentLoaded', () => {
    const enableBtn = document.querySelector('.enable-edit-card')
    const saveBtn = document.querySelector('.save-card')
    const cancelBtn = document.querySelector('.cancel-edit-card')

    const token = document.querySelector('input[name="csrfmiddlewaretoken"]').value
    const avatarImg = document.querySelector('.avatar')
    const photoInput = document.getElementById('photo-input')
    const usernameSpan = document.getElementById('username-span')
    const usernameInput = document.getElementById('username')

    let originalData = {
        username: '',
        photoUrl: ''
    }

    let previewUrl
    let selectedPhoto
    let isUsernameAvailable = true

    function initOriginalData({username, photoUrl}) {
        originalData.username = username
        originalData.photoUrl = photoUrl
    }

    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0]
        if (!file) return 
        selectedPhoto = file
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        previewUrl = URL.createObjectURL(file)
        avatarImg.src = previewUrl
    })

    usernameInput.addEventListener('input', () => handleUsernameInput(usernameInput))
    
    const debounceCheck = debounce(async (input) => {
        isUsernameAvailable = await checkUsername(input)
    }, 500)

    usernameInput.addEventListener('input', () => debounceCheck(usernameInput))
    
    enableBtn.addEventListener('click', () => {
        enableBtn.classList.add('hidden')
        enableBtn.parentElement.nextElementSibling.querySelectorAll('.hidden-part').forEach(elem => elem.classList.remove('hidden'))
        enableBtn.parentElement.nextElementSibling.querySelector('.username').classList.add('hidden')
        enableBtn.parentElement.parentElement.classList.add('highlighted-border')
        enableBtn.nextElementSibling.classList.remove('hidden')
        initOriginalData({username: usernameSpan.textContent, photoUrl: avatarImg.src})     
    })

    cancelBtn.addEventListener('click', ()=> {
        const parent = cancelBtn.parentElement
        parent.classList.add('hidden')
        parent.parentElement.nextElementSibling.querySelectorAll('.hidden-part').forEach(elem => elem.classList.add('hidden'))
        parent.parentElement.nextElementSibling.querySelectorAll('.error-msg').forEach(elem => elem.classList.add('hidden'))
        parent.parentElement.nextElementSibling.querySelector('.username').classList.remove('hidden')
        parent.parentElement.parentElement.classList.remove('highlighted-border')
        parent.previousElementSibling.classList.remove('hidden')
        avatarImg.src = originalData.photoUrl
        usernameInput.value = originalData.username
        usernameSpan.textContent = originalData.username
        selectedPhoto = null
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
            previewUrl = null
        }
    })

    saveBtn.addEventListener('click', async () => {
        if (originalData.username === usernameInput.value && !selectedPhoto) {
            cancelBtn.click()
            return
        }
        if (!isUsernameAvailable) return
        if (!validateUsername(usernameInput)) return
        const formData = new FormData()
        formData.append('username', usernameInput.value)
        if (selectedPhoto) formData.append('avatar', selectedPhoto)
        const res = await fetch('/profile/settings/update-personal-data', {
            method: 'POST',
            headers: {'X-CSRFToken': token},
            body: formData
        })
        const { success, data } = await res.json()
        if (success) {
            initOriginalData({username: data.username, photoUrl: data.photo_url})
            cancelBtn.click()
        } else {
            usernameInput.nextElementSibling.classList.remove('hidden')
            usernameInput.nextElementSibling.textContent = "Таке ім'я користувача вже існує"
        }
    })
})