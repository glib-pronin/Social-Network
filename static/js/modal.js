document.addEventListener('DOMContentLoaded', () => {
    const modals = document.querySelectorAll('.modal-container')

    modals.forEach(modal => {
        modal.addEventListener('click', () => {
            modal.classList.add('hidden')
        })
        const form = modal.querySelector('form')
        form.addEventListener('click', (e) => {
            e.stopPropagation()
        })
        form.querySelector('.close-modal').addEventListener('click', () => {
            modal.classList.add('hidden')
        })
    })
})