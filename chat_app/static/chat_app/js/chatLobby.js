document.addEventListener('DOMContentLoaded', () => {
    const subNav = document.getElementById('sub-nav')
    const contactsBlock = document.getElementById('contacts-block')
    const messagesBlock = document.getElementById('messages-block')
    const groupsBlock = document.getElementById('groups-block')
    const secondBlock = document.getElementById('second-block')
    const createGroupBtns = Array.from(document.querySelectorAll('.create-group'))
    const elements = [contactsBlock, contactsBlock.parentElement, messagesBlock, messagesBlock.parentElement, groupsBlock, secondBlock, ...createGroupBtns]
    
    subNav.addEventListener('click', (e) => {
        const clickedSpan = e.target.closest('button')
        if (!clickedSpan) return
        subNav.querySelectorAll('button').forEach(bt => bt.classList.remove('selected'))
        clickedSpan.classList.add('selected')
        hideElments()
        if (clickedSpan.dataset.type === 'contacts') {
            contactsBlock.classList.remove('hidden')
            contactsBlock.parentElement.classList.remove('hidden')
        } else if (clickedSpan.dataset.type === 'messages') {
            messagesBlock.classList.remove('hidden')
            messagesBlock.parentElement.classList.remove('hidden')
        } else if (clickedSpan.dataset.type === 'groups') {
            groupsBlock.classList.remove('hidden')
            groupsBlock.parentElement.classList.remove('hidden')
            createGroupBtns.find(btn => btn.id === 'mobile-btn').classList.remove('hidden')
        }
    })

    function handleResize() {
        if (window.innerWidth >= 1100) {
            hideElments(false)
            createGroupBtns.find(btn => btn.id === 'mobile-btn')?.classList.add('hidden')
        } else {
            subNav.querySelector('button.selected')?.click()
        }
    }
    handleResize()

    function hideElments(hide = true) {
        elements.forEach(el => el.classList.toggle('hidden', hide))
    }

    window.addEventListener('resize', () => handleResize())

    const searchInput = document.querySelector('.search-input')
    const contacts = document.querySelectorAll('.contact')
    const onInput = debounce(() => {
        const value = searchInput.value.trim()

        contacts.forEach(contact => {
            const name = contact.querySelector('span').textContent.toLowerCase()
            contact.classList.toggle('hidden', !name.includes(value))
        })
    }, 300)
    searchInput.addEventListener('input', onInput)
})