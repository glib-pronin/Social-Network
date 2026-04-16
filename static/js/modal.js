document.addEventListener('DOMContentLoaded', () => {
    const modals = document.querySelectorAll('.modal-container')
    const menus = document.querySelectorAll('.menu-container')
    const confirmModal = document.getElementById('confirm-action-modal')
    const cancelModalBtn = confirmModal?.querySelector('#cancel-action-btn')
    const notificationModal = document.getElementById('notification-modal')
    const myPhotosModal = document.getElementById('my-photos-modal')
    const chooseMyPhotoBtn = document.getElementById('choose-my-photo')

    cancelModalBtn?.addEventListener('click', () => {
        confirmModal.classList.add('hidden')
        callback = null
    })

    confirmModal?.querySelector('#accept-action-btn')?.addEventListener('click', async () => {
        await confirmModal.callback?.()
        cancelModalBtn.click()
    })


    modals.forEach(modal => {        
        const form = modal.querySelector('form')
        const closeModal = form.querySelector('.close-modal')        
        closeModal.addEventListener('click', () => {            
            modal.classList.add('hidden')
            modal.querySelectorAll('input').forEach(inp => inp.value = '')
            modal.querySelectorAll('.error-msg').forEach(err => err.classList.add('hidden'))
        })
        modal.querySelector('.cancel-btn')?.addEventListener('click', () => {
            closeModal.click()
        })
        modal.addEventListener('click', () => {
            closeModal.click()
        })
        form.addEventListener('click', (e) => {
            e.stopPropagation()
        })
    })

    document.addEventListener('click', (e) => {
        if (e.target.closest('.close-menu')) {
            const section = e.target.closest('.has-menu')
            section.querySelector('.menu-container').classList.add('hidden')
            return
        }
        if (e.target.closest('.menu-container')) return
        else {
            const menus = document.querySelectorAll('.menu-container')
            menus.forEach(m => m.classList.add('hidden'))
        }
    }, true)
    
    notificationModal.addEventListener('click', () => {
        const notficationContainer = notificationModal.querySelector('.notification-container')
        const url = notficationContainer?.dataset.url
        if (url) window.location.href = url
    })

    chooseMyPhotoBtn?.addEventListener('click', async () => {
        const res = await fetch('/profile/albums/get-my-photos')
        const { photos } = await res.json()
        myPhotosModal.querySelector('.have-no-photo').classList.toggle('hidden', photos.length > 0)      
        const imagesGrid = myPhotosModal.querySelector('.imgs-grid')
        imagesGrid.querySelectorAll('.img-container').forEach(imc => imc.remove())
        photos.forEach(photo => {
            const container = document.createElement('div')
            container.classList.add('img-container')
            const img = document.createElement('img')
            img.style.cursor = 'pointer'
            img.src = photo.url
            img.dataset.id = photo.id
            container.append(img)
            imagesGrid.append(container)
        })
        myPhotosModal.classList.remove('hidden')
    })

    myPhotosModal?.addEventListener('dblclick', (e) => myPhotosModal.dbclickHandler?.(e))
})
