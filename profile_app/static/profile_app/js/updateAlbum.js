function handleUpdateAlbum(e, albumModal, token) {
    albumModal.querySelector('.form-text').textContent = 'Редагувати альбом'
    const section = e.target.closest('.section')

    const albumId = section.dataset.albumId
    const albumName = section.querySelector('.album-name')
    const albumTheme = section.querySelector('.album-theme')
    const albumYear = section.querySelector('.album-year')
    const form = albumModal.querySelector('form')

    form.name.value = albumName.textContent
    form.theme.value = albumTheme.textContent
    form.year.value = albumYear.textContent.replace(' рік', '')
    albumModal.classList.remove('hidden')
    return async (e) => {
        e.preventDefault()
        if (!isValidForm()) return
        if (
            albumName.textContent === form.name.value && 
            albumTheme.textContent ===  form.theme.value && 
            albumYear.textContent === form.year.value + ' рік'
        ) {
            albumModal.querySelector('.close-modal').click()
            return
        }
        const res = await fetch(`/profile/albums/update-album/${albumId}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'X-CSRFToken': token},
            body: JSON.stringify({name: form.name.value, theme: form.theme.value, year: form.year.value})
        })
        const { success, data } = await res.json()
        if (success) {
            albumName.textContent = data.name
            albumTheme.textContent = data.theme
            albumYear.textContent = data.year + ' рік'
        }
        albumModal.querySelector('#album-modal-cancel-btn').click()
    }
}