document.addEventListener('DOMContentLoaded', () => {
    const addTagBtn = document.getElementById('add-tag')
    const addTagContainer = document.getElementById('save-tag')
    const saveBtn = addTagContainer.querySelector('button')
    const newTagInput = saveBtn.previousElementSibling
    const tagList = document.querySelectorAll('.tag')
    const tagContainer = document.querySelector('.tags-container')
    const token = document.querySelector('form').elements.csrfmiddlewaretoken.value

    const linksContainer = document.getElementById('links')
    const addLinkBtn = document.getElementById('add-link')

    function createTag(tagName) {
        tag = document.createElement('span')
        tag.textContent = tagName
        tag.classList.add('tag', 'selected')
        tagContainer.insertBefore(tag, addTagBtn)
    }

    tagContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('tag')) {
            e.target.classList.toggle('selected')
        }
    })

    addTagBtn.addEventListener('click', () => {
        addTagBtn.classList.add('hidden')
        addTagContainer.classList.remove('hidden')
    })
    
    saveBtn.addEventListener('click', async () => {
        const tagName = newTagInput.value
        addTagBtn.classList.remove('hidden')
        addTagContainer.classList.add('hidden')
        const isTagExist = Array.from(tagList).some(tag => tag.textContent === tagName)
        if (tagName.trim() !== '#' && !isTagExist) {
            const res = await fetch('/create-tag', {
                method: 'Post',
                headers: {"Content-Type": "application/json", "X-CSRFToken": token},
                body: JSON.stringify({ tagName: tagName.replace('#', '') })
            })
            createTag(tagName)
        }
        newTagInput.value = '#'
    })

    newTagInput.addEventListener('input', () => {
        let value = newTagInput.value
        value = value.replaceAll(/[^a-z\u0400-\u04FF]/g, '')
        newTagInput.value = '#' + value
    })

    addLinkBtn.addEventListener('click', () => {
        const container = document.createElement('div')
        container.classList.add('link')
        const input = document.createElement('input')
        input.name = 'link'
        input.placeholder = 'Введіть посилання'
        const deleteLinkBtn = document.createElement('button')
        deleteLinkBtn.type = 'button'
        deleteLinkBtn.classList.add('control-btn', 'delete-link-btn')
        deleteLinkBtn.textContent = '-'
        container.append(input, deleteLinkBtn)
        const label = linksContainer.querySelector('label')
        linksContainer.insertBefore(container, label.nextElementSibling)
    })

    linksContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-link-btn')) {
            const parent = e.target.parentElement
            parent.remove()
        }
    })
})