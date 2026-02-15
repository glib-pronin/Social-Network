document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('create-post-modal')
    const form = modal.querySelector('form')
    const addTagBtn = document.getElementById('add-tag')
    const addTagContainer = document.getElementById('save-tag')
    const saveBtn = addTagContainer.querySelector('button')
    const newTagInput = saveBtn.previousElementSibling
    const tagList = document.querySelectorAll('.tag')
    const tagContainer = document.querySelector('.tags-container')
    const tagListSpan = document.querySelector('.selected-tags-list')
    let textForTagListSpan = []
    const token = document.querySelector('input[name="csrfmiddlewaretoken"]').value

    const linksContainer = document.getElementById('links')
    const addLinkBtn = document.getElementById('add-link')
    const removeLinkBtn = document.getElementById('remove-link')
    const firstInput = addLinkBtn.previousElementSibling

    const openForm = document.getElementById('open-form')
    const openFormMobile = document.getElementById('open-create-post-mobile')

    const openCreatePost = async (e) => {
        e.preventDefault()
        await cleanForm(modal)
        modal.classList.remove('hidden')
        const textarea = modal.querySelector('textarea') 
        textarea.value = openForm.previousElementSibling.value
        textarea.style.height = '20px'
        openForm.previousElementSibling.value = '' 
        textForTagListSpan = []
        tagListSpan.classList.add('hidden')
    }

    openForm?.addEventListener('click', openCreatePost)
    openFormMobile.addEventListener('click', openCreatePost)

    form.elements.content.addEventListener('input', () => {
        const textarea = form.elements.content
        textarea.style.height = '20px'
        textarea.style.height = textarea.scrollHeight + 'px'
        console.log(textarea.scrollHeight);
        
    })

    tagContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('tag')) {
            const tag = e.target
            tag.classList.toggle('selected')
            const tagText = tag.textContent
            const index = textForTagListSpan.indexOf(tagText)
            if (tag.classList.contains('selected') && index === -1) {
                textForTagListSpan.push(tag.textContent)
            } else if (!tag.classList.contains('selected') && index !== -1) {
                textForTagListSpan.splice(index, 1)
            }
            tagListSpan.textContent = textForTagListSpan.join(' ')
            tagListSpan.classList.toggle('hidden', textForTagListSpan.length === 0)
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
        const formData = new FormData()
        const title = form.elements.title.value
        if (!title) return
        formData.append('title', title)
        const tags = Array.from(document.querySelectorAll('.tag.selected')).map(tag => tag.dataset.id).filter(Boolean)
        formData.append('tags', JSON.stringify(tags))
        const links = Array.from(form.querySelectorAll('input[name="link"]')).map(link => link.value.trim()).filter(Boolean).join('; ')
        formData.append('links', links)
        formData.append('subject', form.elements.subject.value)
        formData.append('content', form.elements.content.value)
        const rows = form.imagesState ?? []
        console.log(rows);
        
        if (rows.length > 0) {
            const positions = []
            rows.forEach((row, rowInd) => {
                row.items.forEach((item, itemInd) => {
                    console.log(item.file);
                    if (item.file) {
                        console.log('1');
                        
                        formData.append('images', item.file)
                        positions.push({row: rowInd, col: itemInd})
                    }
                })
            })
            formData.append('positions', JSON.stringify(positions))
        }        
        const res = await fetch('/create-post', {
            method: 'POST',
            headers: {'X-CSRFToken': token},
            body: formData 
        })
        const data = await res.json()
        console.log(data);
        
        if (data.success) {
            modal.classList.add('hidden')
        }
    })
})