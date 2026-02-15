document.addEventListener('DOMContentLoaded', () => {
    const enableBtns = document.querySelectorAll('.enble-editing')
    const cancelBtns = document.querySelectorAll('.cancel-btn')

    enableBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.add('hidden')
            const btnContainer = btn.parentElement
            btnContainer.nextElementSibling.classList.remove('disabled')
            btnContainer.nextElementSibling.querySelectorAll('.data-container').forEach(elem => elem.classList.remove('disabled'))
            btnContainer.parentElement.parentElement.classList.add('highlighted-border')
            btnContainer.nextElementSibling.querySelectorAll('input').forEach(input => {
                input.disabled = false
            })
            btnContainer.nextElementSibling.querySelectorAll('.hidden-part').forEach(elem => {
                elem.classList.remove('hidden')
            })
            const sibling = btnContainer.parentElement.nextElementSibling || btnContainer.parentElement.previousElementSibling
            sibling.classList.add('hidden')
            btn.nextElementSibling.classList.remove('hidden')
        })
    })

    cancelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.parentElement.classList.add('hidden')
            const btnContainer = btn.parentElement.parentElement
            btnContainer.nextElementSibling.classList.add('disabled')
            btnContainer.parentElement.parentElement.classList.remove('highlighted-border')
            btnContainer.nextElementSibling.querySelectorAll('input').forEach(input => {
                input.disabled = true
                input.value = input.dataset.value ? input.dataset.value : '' 
            })
            btnContainer.nextElementSibling.querySelectorAll('.error-msg').forEach(elem => {
                elem.classList.add('hidden')
            })
            btnContainer.nextElementSibling.querySelectorAll('.hidden-part').forEach(elem => {
                elem.classList.add('hidden')
            })
            const sibling = btnContainer.parentElement.nextElementSibling || btnContainer.parentElement.previousElementSibling
            sibling.classList.remove('hidden')
            btn.parentElement.previousElementSibling.classList.remove('hidden')
        })
    })
})