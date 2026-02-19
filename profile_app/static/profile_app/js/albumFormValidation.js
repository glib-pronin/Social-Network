const MIN_LENGTH = 3
const MAX_LENGTH = 50
const MIN_YEAR = 1900
const CURRENT_YEAR = new Date().getFullYear()

function initValidation() {
    const form = document.getElementById('album-modal').querySelector('form')
    const albumName = form.elements.name
    const albumTheme = form.elements.theme
    const albumYear = form.elements.year
    albumName.addEventListener('input', () => albumName.nextElementSibling.classList.add('hidden'))
    albumTheme.addEventListener('input', () => albumTheme.nextElementSibling.classList.add('hidden'))
    albumYear.addEventListener('input', () => {
        albumYear.nextElementSibling.classList.add('hidden')
        let value = albumYear.value
        value = value.replaceAll(/[^0-9]/g, '')
        value = value.slice(0, 4)
        albumYear.value = value
    })
}

function isValidForm() {
    const form = document.getElementById('album-modal').querySelector('form')
    const albumName = form.elements.name
    const albumTheme = form.elements.theme
    const albumYear = form.elements.year
    let isValid = true
    if (albumName.value.length < MIN_LENGTH || albumName.value.length > MAX_LENGTH) {
        albumName.nextElementSibling.classList.remove('hidden')
        isValid = false
    }
    if (albumTheme.value.length < MIN_LENGTH || albumTheme.value.length > MAX_LENGTH) {
        albumTheme.nextElementSibling.classList.remove('hidden')
        isValid = false
    }
    const year = Number(albumYear.value)
    if (albumYear.value.length !== 4 || isNaN(year) || year < MIN_YEAR || year > CURRENT_YEAR) {
        albumYear.nextElementSibling.classList.remove('hidden')
        isValid = false
    }
    return isValid
}