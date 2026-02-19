document.addEventListener('DOMContentLoaded', () => {
    const layoutContent = document.querySelector('.layout-content')
    const fileInput = document.getElementById('file-input-album')
    const addDefaultPhoto = document.getElementById('add-photo-default')
    const addAlbumBlock = document.getElementById('add-new-album-block')
    const addAlbumBtn = addAlbumBlock.querySelector('#add-new-album')
    const albumModal = document.getElementById('album-modal')
    const token = document.querySelector('input[name="csrfmiddlewaretoken"]').value

    let imgContainer = null
    let albumType = null
    let albumCb = null
    // Додавання фото до дефлтного альбому
    addDefaultPhoto.addEventListener('click', () => {
        fileInput.dataset.albumId = addDefaultPhoto.dataset.albumId
        imgContainer = addDefaultPhoto.parentElement.nextElementSibling
        albumType = 'default'
        fileInput.click()
    })
    // Обробка завантаження фото
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0]
        console.log((e.target));      
        if (!file) return
        const formData = new FormData()
        formData.append('photo', file)
        formData.append('album_id', fileInput.dataset.albumId)
        const res = await fetch('/profile/albums/add-photo', {
            method: 'POST',
            headers: {
                'X-CSRFToken': token
            },
            body: formData
        })
        const {success, photoUrl, photoId, isShown} = await res.json()
        if (success) {
            const imgWrapper = document.createElement('div')
            imgWrapper.classList.add('album-photo')
            const img = document.createElement('img')
            img.src = photoUrl
            const deleteBtn = document.createElement('button')
            deleteBtn.append(createTrashIcon())
            deleteBtn.classList.add('delete-photo')
            deleteBtn.dataset.photoId = photoId
            imgWrapper.append(img, deleteBtn)
            if (albumType === 'default') {
                imgContainer.append(imgWrapper)
            } else {
                const hideBtn = document.createElement('button')
                hideBtn.classList.add('toggle-photo')
                hideBtn.classList.toggle('hidden', !isShown)
                hideBtn.append(createHideSVG())
                const showBtn = document.createElement('button')
                showBtn.classList.add('toggle-photo')
                showBtn.classList.toggle('hidden', isShown)
                showBtn.append(createShowSVG())
                imgWrapper.append(hideBtn, showBtn)
                const child = imgContainer.querySelector('.add-new-block')
                if (child) imgContainer.insertBefore(imgWrapper, child)
            }

        }
        imgContainer = null
        albumType = null
    })
    // Валідація полів форми
    initValidation()
    // Додавання нового альбому
    addAlbumBtn.addEventListener('click', () => {
        albumCb = async (e) => {
            e.preventDefault()
            const form = albumModal.querySelector('form')
            if (!isValidForm()) return
            const res = await fetch('/profile/albums/create-album', {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'X-CSRFToken': token},
                body: JSON.stringify({name: form.name.value, theme: form.theme.value, year: form.year.value})
            })
            const { success, html } = await res.json()
            if (success) {
                addAlbumBlock.insertAdjacentHTML('beforebegin', html)
                addAlbumBlock.querySelector('.msg-to-user').textContent = 'Створіть новий альбом'
            }
            albumModal.querySelector('#album-modal-cancel-btn').click()
        }
        albumModal.classList.remove('hidden')
    })
    // Обробники кнопок форми
    albumModal.addEventListener('submit', (e) => albumCb?.(e))
    albumModal.querySelector('#album-modal-cancel-btn').addEventListener('click', () => {
        albumCb = null
        albumModal.classList.add('hidden')
    })
    // Делегація обробників
    layoutContent.addEventListener('click', async (e) => {
        if (e.target.closest('.delete-photo')) {
            const deleteBtn = e.target.closest('.delete-photo')
            const photoId = deleteBtn.dataset.photoId
            const res = await fetch(`/profile/albums/delete-photo/${photoId}`, { method: 'POST', headers: {'X-CSRFToken': token} })
            const {success} = await res.json()
            if (success) {
                deleteBtn.parentElement.remove()
            }
        }

        else if (e.target.closest('.add-new-photo')) {
            const addBtn = e.target.closest('.add-new-photo')
            fileInput.dataset.albumId = addBtn.dataset.albumId
            imgContainer = addBtn.parentElement.parentElement
            albumType = 'album'
            fileInput.click()
        }

        else if (e.target.closest('.toggle-photo')) {
            const togglePhoto = e.target.closest('.toggle-photo')
            const photoId = togglePhoto.dataset.photoId
            toggleAlbumElement(token, togglePhoto, `/profile/albums/toggle-photo/${photoId}`, '.toggle-photo.hidden')
        }

        else if (e.target.closest('.toggle-album')) {
            const toggleAlbum = e.target.closest('.toggle-album')
            const albumId = toggleAlbum.dataset.albumId
            toggleAlbumElement(token, toggleAlbum, `/profile/albums/toggle-album/${albumId}`, '.toggle-album.hidden', true)
        }

        else if (e.target.closest('.open-menu')) {
            const section = e.target.closest('.section')
            section.querySelector('.menu-container').classList.remove('hidden')
        }

        else if (e.target.closest('.close-menu')) {
            const section = e.target.closest('.section')
            section.querySelector('.menu-container').classList.add('hidden')
        }
        
        else if (e.target.closest('.update-menu')) {   
            albumCb = handleUpdateAlbum(e, albumModal, token)
        }
        
        else if (e.target.closest('.delete-menu')) {   
            const section = e.target.closest('.section')
            const confirmModal = document.getElementById('confirm-delete-album-modal')
            confirmModal.classList.remove('hidden')
            confirmModal.dataset.albumId = section.dataset.albumId
            confirmModal.sectionToDelete = section
        }
    })
})