document.addEventListener('DOMContentLoaded', () => {
    const requestsContainer = document.getElementById('friends-request-preview')
    const recommendationContainer = document.getElementById('friends-recommendation-preview')
    const friendsContainer = document.getElementById('friends-preview')
    const modal = document.getElementById('confirm-action-modal')
    const cancelModalBtn = modal?.querySelector('#cancel-action-btn')
    const token = document.querySelector('input[name="csrfmiddlewaretoken"]').value

    const emptyMsgs = {
        request: {
            has_more: "Ви опрацювали усі запити з прев'ю. Для перегляду решти перейдіть до відповідної вкладки.", 
            empty: 'Вам поки що ніхто не надсилав запитів на дружбу.'
        },
        recommendation: {
            has_more: "Ви опрацювали усі рекомендації з прев'ю. Для перегляду решти перейдіть до відповідної вкладки.", 
            empty: 'Ми поки не можемо скласти для вас рекомендації.'
        },
        friend: {
            has_more: "Ви видалили усіх друзів з прев'ю. Для перегляду решти перейдіть до відповідної вкладки.", 
            empty: 'У вас поки що немає друзів.'
        },
    }

    function showResultMsg(msgContainer, text) {
        msgContainer.textContent = text
        msgContainer.classList.remove('hidden')
        setTimeout(() => msgContainer.classList.add('hidden'), 5000)
    }
    
    function isEmptySection(container, key) {
        let text = container.dataset.hasMore === 'False' ? emptyMsgs[key].empty : emptyMsgs[key].has_more
        if (container.dataset.mode === 'fullscreen') {
            text = emptyMsgs[key].empty
        }
        const content = container.querySelector('.friends-section-content')
        if (content.querySelectorAll('.friends-section-card').length > 0) return
        const msgContainer = container.querySelector('.empty-msg')
        msgContainer.textContent = text
        msgContainer.classList.remove('hidden')
    }

    function getRecommendationCount(container) {
        if (container.dataset.mode === 'fullscreen') return 0 
        return recommendationContainer.querySelectorAll('.friends-section-card').length
    }

    function changeRecommendationHasMore(container, hasMore) {
        if (container.dataset.mode === 'fullscreen') return
        recommendationContainer.dataset.hasMore = hasMore
        isEmptySection(container, 'recommendation')
        console.log(hasMore);
    }

    function checkFriends(card) {
        const friendContent = friendsContainer.querySelector('.friends-section-content')
        if (friendContent.querySelectorAll('.friends-section-card').length >= 6) {
            friendContent.querySelector('.friends-section-card:last-child').remove()
        } else if (friendContent.querySelectorAll('.friends-section-card').length === 0) {
            friendsContainer.querySelector('.empty-msg').classList.add('hidden')
        }
        friendContent.prepend(card)
    }

    async function handleRequestProcessing(card, profileId, action) {
        const url = (action === 'accept') ? `/profile/friends/accept-friend-request/${profileId}?loaded=${getRecommendationCount(requestsContainer)}` : `/profile/friends/cancel-friend-request/${profileId}?loaded=${getRecommendationCount(requestsContainer)}`
        const res = await fetch(url, { method: 'POST', headers: {'X-CSRFToken': token} })
        const { success, has_more_rec, request_count } = await res.json()
        cancelModalBtn.click()
        if (success) {
            card.remove()
            changeRequestCount(request_count)
            if (action === 'accept' && requestsContainer.dataset.mode != 'fullscreen')  {
                checkFriends(card)
                changeRecommendationHasMore(requestsContainer, has_more_rec)
            }
            showResultMsg(requestsContainer.querySelector('.result-msg'), (action === 'accept') ? 'Користувача додано до друзів!' : 'Запит на дружбу відхилено!')
            isEmptySection(requestsContainer, 'request')
        }
    }

    requestsContainer?.addEventListener('click', async (e) => {
        const btn = e.target.closest('button')
        if (!btn) return
        const card = btn.closest('.friends-section-card')
        const profileId = parseInt(card.dataset.id)
        if (isNaN(profileId)) return
        const action = btn.dataset.action
        if (action === 'decline') {
            modal.classList.remove('hidden')
            modal.querySelector('p').textContent = 'Ви дійсно хочете відхилити запит?'
            modal.callback = () => handleRequestProcessing(card, profileId, action)
        } else {
            handleRequestProcessing(card, profileId, action)
        } 
    })

    recommendationContainer?.addEventListener('click', async (e) => {
        const btn = e.target.closest('button')
        if (!btn) return
        const card = btn.closest('.friends-section-card')
        const profileId = parseInt(card.dataset.id)
        if (isNaN(profileId)) return
        const res = await fetch(`/profile/friends/add-friend/${profileId}`, { method: 'POST', headers: {'X-CSRFToken': token} })
        const { success, msg, has_more_rec } = await res.json()
        if (success) {
            card.remove()
            if (msg === 'created_friend' && recommendationContainer.dataset.mode != 'fullscreen') checkFriends(card)
            showResultMsg(recommendationContainer.querySelector('.result-msg'), 'Запит на дружбу надіслано!')
            isEmptySection(recommendationContainer, 'recommendation')
        }
    })

    friendsContainer?.addEventListener('click', (e) => {
        const btn = e.target.closest('button.delete-btn')
        if (!btn) return
        const card = btn.closest('.friends-section-card')
        const profileId = parseInt(card.dataset.id)
        if (isNaN(profileId)) return
        modal.classList.remove('hidden')
        modal.querySelector('p').textContent = 'Ви дійсно хочете видалити користувача?'
        modal.callback = async () => {
            const res = await fetch(`/profile/friends/remove-friend/${profileId}?loaded=${getRecommendationCount(friendsContainer)}`, { method: 'POST', headers: {'X-CSRFToken': token} })
            const { success, has_more_rec } = await res.json()
            cancelModalBtn.click()
            if (success) {
                card.remove()
                showResultMsg(friendsContainer.querySelector('.result-msg'), 'Користувача видалено з Ваших друзів!')
                isEmptySection(friendsContainer, 'friend')
                changeRecommendationHasMore(friendsContainer, has_more_rec)
            }
        }
    })
})