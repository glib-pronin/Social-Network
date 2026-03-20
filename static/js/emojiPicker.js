document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('emoji-picker')
    const emojiBtns = document.querySelectorAll('.emoji-btn')
    const emojiContainer = modal?.querySelector('.emoji-container')
    const emojiSearchInput = modal?.querySelector('input')

    let currentCategory = 'default'
    let searchValue = ''
    let textarea = null

    emojiBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showEmojiPicker(btn)
            renderEmoji()
        })
    })

    function showEmojiPicker(btn) {
        const rect  = btn.getBoundingClientRect()
        modal.classList.remove('hidden')

        const modalHeight = modal.offsetHeight
        const modalWidth = modal.offsetWidth
        let top 
        let left

        if (rect.top < modalHeight) {
            top = rect.bottom
        } else {
            top = rect.top - modalHeight
        }

        left = rect.left        
        if (left + modalWidth > window.innerWidth) {
            left = window.innerWidth - modalWidth
        }        
        if (left > 20) left -= 20
        modal.style.left = `${left}px`
        modal.style.top = `${top}px`

        const container = btn.parentElement.parentElement
        textarea = container.querySelector('.textarea')
    }

    const handleSearch = debounce((value) => {
        searchValue = value.toLowerCase()
        renderEmoji()
    }, 300)

    emojiSearchInput?.addEventListener('input', (e) => handleSearch(e.target.value))

    function renderEmoji() {
        emojiContainer.innerHTML = ''
        let list
        if (currentCategory !== 'used') {
            list = EMOJI[currentCategory] || []
        } else {
            list = getUsedEmoji().sort((a, b) => b.lastUsed - a.lastUsed)
        }
        const filtered = list.filter(e => e.keywords.some(k => k.includes(searchValue)))
        filtered.forEach(e => {
            const span = document.createElement('span')
            span.classList.add('emoji-item')
            span.dataset.symbol = e.symbol
            span.dataset.keywords = e.keywords.join(',')
            span.textContent = e.symbol
            emojiContainer.append(span)
        });
    }

    modal?.addEventListener('click', (e) => {
        const emoji = e.target.closest('.emoji-item')
        if (emoji) {
            insertEmoji(emoji)
            return
        }
        const category = e.target.closest('.emoji-category')
        if (category) {
            console.log('..');
            
            changeCategory(category)
            return
        }
    })

    function insertEmoji(emoji) {
        if (!textarea) return

        let start = textarea.selectionStart        
        let end = textarea.selectionEnd
        const text = textarea.value
        textarea.value = text.slice(0, start) + emoji.dataset.symbol + text.slice(end)
        const newPos = start + emoji.dataset.symbol.length
        textarea.selectionStart = newPos
        textarea.selectionEnd = newPos
        textarea.focus()

        addUsedEmoji(emoji.dataset.symbol, emoji.dataset.keywords.split(','))
    }

    function changeCategory(category) {
        currentCategory = category.dataset.category
        modal.querySelector('.emoji-category.selected').classList.remove('selected')
        category.classList.add('selected')
        renderEmoji()
    }

    function getUsedEmoji() {
        return JSON.parse(localStorage.getItem('usedEmoji') || '[]')
    }

    function addUsedEmoji(symbol, keywords) {
        let list = getUsedEmoji()

        const existing = list.find(e => e.symbol === symbol)

        if (existing) {
            existing.lastUsed = Date.now()
        } else {
            list.push({
                symbol: symbol,
                keywords: keywords,
                lastUsed: Date.now()
            })
        }

        if (list.length > 20) {
            list.sort((a, b) => b.lastUsed - a.lastUsed)
            list.pop()
        }
        localStorage.setItem('usedEmoji', JSON.stringify(list))
    }
})