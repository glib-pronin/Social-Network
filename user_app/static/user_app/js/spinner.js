function showSpinner(show, container, btnsContainer = null) {
    const loading = container.querySelector('.loading')
    const sendBtn = container.querySelector('.send-btn')
    loading.classList.toggle('hidden', !show)
    sendBtn?.classList.toggle('hidden', show)
    if (btnsContainer) btnsContainer.classList.toggle('hidden', show)
}

function showPostLoading() {
    const modal = document.getElementById('post-loading-modal')
    const loading = document.getElementById('post-loading-block')
    const success = document.getElementById('loading-success-block')
    
    success.classList.add('hidden')
    loading.classList.remove('hidden')
    modal.classList.remove('hidden')
}

function showPostSuccess() {
    const modal = document.getElementById('post-loading-modal')
    const loading = document.getElementById('post-loading-block')
    const success = document.getElementById('loading-success-block')

    success.classList.remove('hidden')
    loading.classList.add('hidden')
    setTimeout(() => {
        modal.classList.add('fade-out')
        modal.addEventListener('transitionend', () => {
            modal.classList.add('hidden')
            modal.classList.remove('fade-out')
        }, { once: true })
    }, 2000);
}