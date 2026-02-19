async function toggleAlbumElement(token, element, url, cssClass, changeMunu = false) {
    const res = await fetch(url, {method: 'POST', headers: {'X-CSRFToken': token}})
    const { success } = await res.json()
    if (success) {
        element.parentElement.querySelector(cssClass).classList.remove('hidden')
        element.classList.add('hidden')
        if (changeMunu) {
            const section = element.closest('.section')
            const menu = section.querySelector('.menu-container')
            const hideElement = menu.querySelector('.album-state:not(.hidden')
            const showElement = menu.querySelector('.album-state.hidden') 
            hideElement.classList.add('hidden')
            showElement.classList.remove('hidden')
        }
    }
}