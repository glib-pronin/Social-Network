document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('create-post-modal')
    const form = modal.querySelector('form')
    const addTagBtn = document.getElementById('add-tag')
    const addTagContainer = document.getElementById('save-tag')
    const saveBtn = addTagContainer.querySelector('button')
    const newTagInput = saveBtn.previousElementSibling
    const tagList = document.querySelectorAll('.tag')
    const tagContainer = document.querySelector('.tags-container')
    const token = document.querySelector('form').elements.csrfmiddlewaretoken.value

    const linksContainer = document.getElementById('links')
    const addLinkBtn = document.getElementById('add-link')
    const removeLinkBtn = document.getElementById('remove-link')
    const firstInput = addLinkBtn.previousElementSibling

    const openForm = document.getElementById('open-form')

    openForm.addEventListener('click', async () => {
        await cleanForm(modal)
        modal.classList.remove('hidden')
        modal.querySelector('textarea').value = openForm.previousElementSibling.value
        openForm.previousElementSibling.value = ''
    })

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
        if (tagName.trim() !== '#' && !isTagExist && tagName.trim()) {
            const res = await fetch('/create-tag', {
                method: 'Post',
                headers: {"Content-Type": "application/json", "X-CSRFToken": token},
                body: JSON.stringify({ tagName: tagName.replace('#', '') })
            })
            const { id } = await res.json()
            createTag({tagName, id})
        }
        newTagInput.value = '#'
    })

    newTagInput.addEventListener('input', () => {
        let value = newTagInput.value
        value = value.replaceAll(/[^a-z\u0400-\u04FF]/g, '')
        newTagInput.value = '#' + value
    })

    addLinkBtn.addEventListener('click', () => {
        const input = document.createElement('input')
        input.name = 'link'
        input.placeholder = 'Введіть посилання'
        input.value = firstInput.value
        input.type = 'text'
        firstInput.value = ''
        linksContainer.insertBefore(input, addLinkBtn.parentElement)
        removeLinkBtn.classList.remove('hidden')
    })

    removeLinkBtn.addEventListener('click', () => {
        const inputs = linksContainer.querySelectorAll(':scope > input')
        if (inputs.length > 0) {
            firstInput.value = inputs[inputs.length-1].value 
            inputs[inputs.length-1].remove()
            if (inputs.length === 1) removeLinkBtn.classList.add('hidden')
        }
    })

    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        const title = form.elements.title.value
        if (!title) return
        const tags = Array.from(document.querySelectorAll('.tag.selected')).map(tag => tag.dataset.id).filter(Boolean)
        const links = Array.from(form.querySelectorAll('input[name="link"]')).map(link => link.value.trim()).filter(Boolean).join('; ')
        const payload = {
            title,
            subject: form.elements.subject.value,
            content: form.elements.content.value,
            links,
            tags
        }
        const res = await fetch('/create-post', {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'X-CSRFToken': token},
            body: JSON.stringify(payload) 
        })
        const data = await res.json()
        console.log(data);
        
        if (data.success) {
            modal.classList.add('hidden')
        }
    })
})