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

    const mainLayout = document.querySelector('.main-layout')
    mainLayout.addEventListener('click', async (e) => {        
        const chat = e.target.closest('.chat-handler')
        if (!chat) return

        const res = await fetch(`/chat/get-messages?id=${chat.dataset.id}&has_chat=${chat.classList.contains('chat')}`)
        const data = await res.json()
        secondBlock.querySelector('.welcome-block').classList.add('hidden')
        const blocks = secondBlock.querySelectorAll('.chat-interface')
        blocks.forEach(block => block.classList.remove('hidden'))
        const msgsContainer = blocks[1]
        msgsContainer.innerHTML = data.html

        const msgs = msgsContainer.querySelectorAll('.msg')
        msgs.forEach((m, ind) => {
            const currentDate = m.dataset.date
            const nextMsg = msgs[ind+1]
            if (!nextMsg && !msgs[ind-1]) {
                const dateEl = document.createElement('span')
                dateEl.classList.add('date')
                dateEl.textContent = currentDate
                msgsContainer.insertBefore(dateEl, m.parentElement)
            } else if (nextMsg) {
                const nextDate = nextMsg.dataset.date
                if (new Date(nextDate.split('.').toReversed().join('-')) > new Date(currentDate.split('.').toReversed().join('-'))) {
                    const dateEl = document.createElement('span')
                    dateEl.classList.add('date')
                    dateEl.textContent = nextDate
                    msgsContainer.insertBefore(dateEl, nextMsg.parentElement)
                }
            }
        })
    })
})