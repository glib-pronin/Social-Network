function changeRequestCount(count) {
    const requestCountContainer = document.querySelectorAll('.request-count')
    requestCountContainer.forEach(container => {
        if (!count) {
            container.classList.add('hidden')
            return
        }
        container.classList.remove('hidden')
        container.textContent = count
    })
}    