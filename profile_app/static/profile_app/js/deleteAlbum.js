document.addEventListener('DOMContentLoaded', () => {
    const confirmModal = document.getElementById('confirm-delete-album-modal')
    const addAlbumBlock = document.getElementById('add-new-album-block')
    const btnsContainer = confirmModal.querySelector('.btns-container')
    const token = document.querySelector('input[name="csrfmiddlewaretoken"]').value

    confirmModal.querySelector('#accept-action-btn').addEventListener('click', async () => {
        const albumId = confirmModal.dataset.albumId
        const section = confirmModal.sectionToDelete
        showSpinner(true, confirmModal, btnsContainer)
        confirmModal.showLoading?.(section, 'Видаляємо альбом')
        const res = await fetch(`/profile/albums/delete-album/${albumId}`, { method: 'POST', headers: {'X-CSRFToken': token} })
        showSpinner(false, confirmModal, btnsContainer)
        confirmModal.hideLoading?.(section)
        const { success } = await res.json()
        if (success) {
            section?.remove()
            if (document.querySelectorAll('.section').length < 3) addAlbumBlock.querySelector('.msg-to-user').textContent = 'Немає ще жодного альбому'
        }
        confirmModal.classList.add('hidden')
        confirmModal.sectionToDelete = null
        confirmModal.dataset.albumId = ''
    })
})