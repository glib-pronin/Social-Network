document.addEventListener('DOMContentLoaded', () => {
    const modals = document.querySelectorAll('.modal-container')
    const menus = document.querySelectorAll('.menu-container')
    const confirmModal = document.getElementById('confirm-action-modal')
    const cancelModalBtn = confirmModal?.querySelector('#cancel-action-btn')

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
       if (e.target.closest('.menu-container')) return
       else {
            const menus = document.querySelectorAll('.menu-container')
            menus.forEach(m => m.classList.add('hidden'))
       }
    }, true)
})