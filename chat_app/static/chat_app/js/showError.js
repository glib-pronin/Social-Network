function showError(container, msg) {
    const error = container.querySelector('.error-msg')
    error.textContent = msg
    error.classList.remove('hidden')
    setTimeout(() => error.classList.add('hidden'), 2000)
}