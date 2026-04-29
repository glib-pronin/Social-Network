function changeRequestCount(count) {
    const requestCountContainer = document.querySelectorAll('.request-count')
    requestCountContainer.forEach(container => {
        if (!count) {
            container.textContent = ''
            container.classList.add('hidden')
            return
        }
        container.classList.remove('hidden')
        container.textContent = count
    })
}    

function incrRequestCount() {
    const requestCountContainer = document.querySelectorAll('.request-count')
    requestCountContainer.forEach(container => {
        const count = container.textContent
        container.classList.remove('hidden')
        if (count === '9+') return
        else if (count === '9') {
            container.textContent = '9+'
            return
        }
        let countInt = Number(count)
        container.textContent = ++countInt
    })
}