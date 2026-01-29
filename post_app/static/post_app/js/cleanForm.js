async function cleanForm(modal) {
    const form = modal.querySelector('form')
    const linksContainer = document.getElementById('links')

    form.querySelectorAll('input').forEach(inp => {
        if (inp.id !== 'new-tag-input') inp.value = '';
    })
    linksContainer.querySelectorAll(':scope > input').forEach(inp => inp.remove())
    document.getElementById('remove-link')
    document.querySelectorAll('.tag').forEach(tag => tag.remove())
    const res = await fetch('/get-tags')
    const { tags } = await res.json()
    tags.forEach(tag => createTag(tag, false))
}

function createTag({tagName, id}, selected = true) {
    const addTagBtn = document.getElementById('add-tag')
    const tagContainer = document.querySelector('.tags-container')
    tag = document.createElement('span')
    tag.textContent = tagName
    tag.classList.add('tag')
    tag.classList.toggle('selected', selected)
    tag.dataset.id = id
    tagContainer.insertBefore(tag, addTagBtn)
}