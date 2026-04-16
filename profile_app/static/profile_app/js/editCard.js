document.addEventListener('DOMContentLoaded', () => {
    const enableBtn = document.querySelector('.enable-edit-card')
    const saveBtn = document.querySelector('.save-card')
    const cancelBtn = document.querySelector('.cancel-edit-card')
    const myPhotosModal = document.getElementById('my-photos-modal')
    const token = document.querySelector('input[name="csrfmiddlewaretoken"]').value
    const avatarImg = document.querySelector('.avatar')
    const photoInput = document.getElementById('photo-input')
    const usernameSpan = document.getElementById('username-span')
    const usernameInput = document.getElementById('username')
    const avatarOverlay = document.querySelector('.avatar-overlay-big')

    let originalData = {
        username: '',
        photoUrl: ''
    }

    let previewUrl
    let selectedPhoto
    let myPhotoId
    let removeAvatar = false
    let isUsernameAvailable = true

    function initOriginalData({username, photoUrl}) {
        originalData.username = username
        originalData.photoUrl = photoUrl
    }

    myPhotosModal.dbclickHandler = (e) => {
        const img = e.target.closest('img')
        if (!img) return
        myPhotosModal.classList.add('hidden')
        myPhotoId = img.dataset.id
        revokePreview()
        selectedPhoto = null
        removeAvatar = false
        avatarImg.dataset.enableRemove = 'true' 
        avatarImg.src = img.src   
    }

    avatarOverlay.addEventListener('click', () => {
        if (avatarImg.dataset.enableRemove !== 'true') return
        avatarImg.src = avatarImg.dataset.defaultAvatar
        removeAvatar = true
        revokePreview()
        console.log(previewUrl);
        
        selectedPhoto = null
        myPhotoId = null
        avatarImg.dataset.enableRemove = 'false'
    })

    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0]
        if (!file) return 
        selectedPhoto = file
        myPhotoId = null
        removeAvatar = false
        avatarImg.dataset.enableRemove = 'true' 
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
        if (!avatarImg.src.includes(avatarImg.dataset.defaultAvatar)) avatarImg.dataset.enableRemove = 'true'    
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
        revokePreview()
        avatarImg.dataset.enableRemove = 'false'
    })

    saveBtn.addEventListener('click', async () => {
        if (originalData.username === usernameInput.value && !selectedPhoto && !myPhotoId && !removeAvatar) {
            cancelBtn.click()
            return
        }
        if (!isUsernameAvailable) return
        if (!validateUsername(usernameInput)) return
        const formData = new FormData()
        formData.append('username', usernameInput.value)
        if (selectedPhoto) formData.append('avatar', selectedPhoto)
        if (myPhotoId) formData.append('photoId', myPhotoId)
        if (removeAvatar) formData.append('removeAvatar', '1')
        showSpinner(true, saveBtn.parentElement.parentElement, saveBtn.parentElement)
        const res = await fetch('/profile/settings/update-personal-data', {
            method: 'POST',
            headers: {'X-CSRFToken': token},
            body: formData
        })
        showSpinner(false, saveBtn.parentElement.parentElement, saveBtn.parentElement)
        const { success, data } = await res.json()
        if (success) {
            initOriginalData({username: data.username, photoUrl: data.photo_url})
            cancelBtn.click()
        } else {
            usernameInput.nextElementSibling.classList.remove('hidden')
            usernameInput.nextElementSibling.textContent = "Таке ім'я користувача вже існує"
        }
    })

    function revokePreview() {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
            previewUrl = null
        }
    }
})