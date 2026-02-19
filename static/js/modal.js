document.addEventListener('DOMContentLoaded', () => {
    const modals = document.querySelectorAll('.modal-container')
    const menus = document.querySelectorAll('.menu-container')

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