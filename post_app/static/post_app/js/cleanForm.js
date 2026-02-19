async function cleanForm(modal) {
    const form = modal.querySelector('form')
    const linksContainer = document.getElementById('links')

    form.querySelectorAll('input').forEach(inp => {
        if (inp.id !== 'new-tag-input') inp.value = '';
    })
    linksContainer.querySelectorAll(':scope > input').forEach(inp => inp.remove())
    document.getElementById('remove-link').classList.add('hidden')
    document.querySelectorAll('.tag').forEach(tag => tag.remove())
    const res = await fetch('/get-tags')
    const { tags } = await res.json()
    tags.forEach(tag => createTag(tag, false))
    form.querySelectorAll('.image-item').forEach(imageItem => {
        imageItem.querySelector('.delete-image')?.click()
    })
}

let textForTagListSpan = []


function createTag({tagName, id}, selected = true) {
    const addTagBtn = document.getElementById('add-tag')
    const tagContainer = document.querySelector('.tags-container')
    tag = document.createElement('span')
    tag.textContent = '#' + tagName.replace('#', '')
    tag.classList.add('tag')
    tag.classList.toggle('selected', selected)
    if (selected) {
        const tagListSpan = document.querySelector('.selected-tags-list')
        textForTagListSpan.push(tag.textContent)
        tagListSpan.textContent = textForTagListSpan.join(' ')
        tagListSpan.classList.remove('hidden')
    }
    tag.dataset.id = id
    tagContainer.insertBefore(tag, addTagBtn)
}