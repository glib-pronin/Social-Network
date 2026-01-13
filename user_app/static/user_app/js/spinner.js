function showSpinner(show, container) {
    const loading = container.querySelector('.loading')
    const sendBtn = container.querySelector('.send-btn')
    loading.classList.toggle('hidden', !show)
    sendBtn.classList.toggle('hidden', show)
}