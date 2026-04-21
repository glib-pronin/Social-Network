document.addEventListener('DOMContentLoaded', () => {
    const subNav = document.getElementById('sub-nav')
    const contactsBlock = document.getElementById('contacts-block')
    const messagesBlock = document.getElementById('messages-block')
    const groupsBlock = document.getElementById('groups-block')
    const secondBlock = document.getElementById('second-block')
    const createGroupBtn = document.getElementById('desktop-btn')
    const elements = [contactsBlock, contactsBlock.parentElement, messagesBlock, messagesBlock.parentElement, groupsBlock, secondBlock, createGroupBtn]
    // Функція створення url
    function setTabOrChatInURL({ tab = null, chat = null }) {
        const url = new URL(window.location)
        if (tab) {
            url.searchParams.set('tab', tab)
            url.searchParams.delete('chat')
        } else if (chat) {
            url.searchParams.set('chat', chat)
            url.searchParams.delete('tab')
        }
        url.searchParams.delete('user')
        if (url.toString() !== window.location.toString()) window.history.pushState({}, '', url)
    }
    // Отримання інформації з url
    function getStateFromURL() {
        const params =  new URLSearchParams(window.location.search)
        return { tab: params.get('tab'), chat: params.get('chat'), user: params.get('user') }
    }

    function hideElments(hide = true) {
        elements.forEach(el => el.classList.toggle('hidden', hide))
    }
    // Функція відкриття вкладки (мобілка)
    function openTab(type) {   
        closeWS()     
        secondBlock.resetSelectedImages()
        secondBlock.querySelectorAll('.chat-interface').forEach(block => block.classList.add('hidden'))
        secondBlock.querySelector('.welcome-block').classList.remove('hidden')
        subNav.querySelectorAll('button').forEach(bt => bt.classList.remove('selected'))
        subNav.querySelector(`button[data-type="${type}"]`)?.classList.add('selected')
        hideElments()
        if (type === 'contacts') {
            contactsBlock.classList.remove('hidden')
            contactsBlock.parentElement.classList.remove('hidden')
        } else if (type === 'messages') {
            messagesBlock.classList.remove('hidden')
            messagesBlock.parentElement.classList.remove('hidden')
        } else if (type === 'groups') {
            groupsBlock.classList.remove('hidden')    
            groupsBlock.parentElement.classList.remove('hidden')
        }
    }
    // Функція ініціалізації вкладки або чату
    function initTabsOrChat() {
        const { tab, chat, user } = getStateFromURL()
        if (window.innerWidth >= 1100 && !chat && !user) return
        if (user) {
            const el = document.querySelector(`.contact.chat-handler[data-id="${user}"]`)
            el?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
        } else if (chat) {
            const el = document.querySelector(`.chat.chat-handler[data-id="${chat}"]`)
            el?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
        } else {
            openTab(tab || 'contacts')
        }        
    }

    subNav.addEventListener('click', (e) => {
        const btn = e.target.closest('button')
        if (!btn) return
        const type = btn.dataset.type
        setTabOrChatInURL({ tab: type })
        openTab(type)
    })

    function handleResize() {
        if (window.innerWidth >= 1100) {
            hideElments(false)
        }
        initTabsOrChat()
    }
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('popstate', () => {
        closeWS()
        secondBlock.resetSelectedImages()
        initTabsOrChat()
    })
    // Обробник виходу з чату через кнопку Назад
    secondBlock.querySelector('.back-btn')?.addEventListener('click', () => {
        secondBlock.querySelectorAll('.chat-interface').forEach(block => block.classList.add('hidden'))
        secondBlock.querySelector('.welcome-block').classList.remove('hidden')
        closeWS()
        secondBlock.resetSelectedImages()
        secondBlock.dataset.selected = ''
        if (window.innerWidth < 1100) {
            history.back()
        } else {
            const url = new URL(window.location)
            url.searchParams.delete('chat')
            window.history.pushState({}, '', url)
        }
    })

    const mainLayout = document.querySelector('.main-layout')
    let observer = null

    mainLayout.addEventListener('click', async (e) => {            
        const chat = e.target.closest('.chat-handler')
        if (!chat) return
        if (window.innerWidth < 1100) hideElments()
        if (secondBlock.dataset.selected === chat.dataset.id) { // Перевіряємо, чи вибраний цей чат
            secondBlock.classList.remove('hidden')
            return
        }
        secondBlock.resetSelectedImages()
        const blocks = secondBlock.querySelectorAll('.chat-interface')        
        const msgsContainer = blocks[1]
        msgsContainer.innerHTML = ''
        observer?.disconnect()
        const input = document.getElementById('msg-input') 
        input.value = ''
        const res = await fetch(`/chat/open-chat?id=${chat.dataset.id}&has_chat=${chat.classList.contains('chat')}`)
        
        const data = await res.json()
        if (!data.success) return
        setTabOrChatInURL({ chat: data.id })
        input.value = getMessagesFromStorage()[data.id] ?? ''
        secondBlock.classList.remove('hidden')
        secondBlock.dataset.selected = data.id
        secondBlock.querySelector('.welcome-block').classList.add('hidden')
        setChatInfo(blocks[0], data)
        if (data.isCreatedChat) createChat(data, '.messages-all')
        blocks.forEach(block => block.classList.remove('hidden'))
        
        msgsContainer.innerHTML += data.html
        setDates(msgsContainer, data.hasNext)
        if (data.hasNext) {
            const loader = setMsgLoader(msgsContainer)
            observer = setMessagesObserver(loader, data.cursor, data.hasNext)
        }
        initLightBox()
        msgsContainer.scrollTop = msgsContainer.scrollHeight
        connectWS(data.id)

        if (chat.classList.contains('chat') && chat.dataset.hasUnread === 'True') {
            chat.dataset.hasUnread = 'False'
            sendReadRequest(data.id)
        }
    })

    const searchInput = document.querySelector('.search-input')
    const contacts = document.querySelectorAll('.contact')
    const onInput = debounce(() => {
        const value = searchInput.value.trim().toLowerCase()
        contacts.forEach(contact => {
            const name = contact.querySelector('span').textContent.toLowerCase()
            contact.classList.toggle('hidden', !name.includes(value))
        })
    }, 500)
    searchInput.addEventListener('input', onInput)

    handleResize()
})