function showSpinner(show, container, btnsContainer = null) {
    const loading = container.querySelector('.loading')
    const sendBtn = container.querySelector('.send-btn')
    loading.classList.toggle('hidden', !show)
    sendBtn?.classList.toggle('hidden', show)
    if (btnsContainer) btnsContainer.classList.toggle('hidden', show)
}