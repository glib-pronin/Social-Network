document.addEventListener('DOMContentLoaded', () => {
    const postsContainer = document.getElementById('posts-container')
    const confirmModal = document.getElementById('confirm-action-modal')
    const token = document.querySelector('input[name="csrfmiddlewaretoken"]').value

    postsContainer?.addEventListener('click', async (e) => {
        if (e.target.closest('.open-menu')) {
            e.preventDefault()
            const post = e.target.closest('.post')
            post.querySelector('.menu-container').classList.remove('hidden')
        } else if (e.target.closest('.hide-post')) {
            const post = e.target.closest('.post')
            const postId = post.dataset.postId        
            const res = await fetch(`/hide-post/${postId}`, {
                method: 'POST',
                headers: {'X-CSRFToken': token}
            })    
            const { success } = await res.json()
            if (success) {
                post.remove()
            } else {
                handlePostError(post)
            }

        } else if (e.target.closest('.like')) {
            toggleReaction('like', e.target.closest('.like'))
        } else if (e.target.closest('.heart')) {
            toggleReaction('heart', e.target.closest('.heart'))
        } else if (e.target.closest('.delete-post')) {
            confirmModal.querySelector('p').textContent = 'Ви дійсно хочете видалити цей пост?'
            confirmModal.classList.remove('hidden')
            confirmModal.callback = async () => {
                const post = e.target.closest('.post')
                confirmModal.classList.add('hidden')
                post.remove()
                await fetch(`/delete-post/${post.dataset.postId}`, {
                    method: 'POST',
                    headers: {'X-CSRFToken': token}
                })
            }
        }
    })

    async function toggleReaction(reaction, btn) {
        const post = btn.closest('.post')
        const postId = post.dataset.postId   
        const res = await fetch(`/toggle-reaction/${postId}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'X-CSRFToken': token},
            body: JSON.stringify({reaction_type: reaction})
        })    
        const { success, added, count } = await res.json()
        if (success) {
            const container = btn.closest('.info')
            container.querySelector('.count').textContent = count
            container.querySelector(`.${reaction}.selected`).classList.toggle('hidden', !added)
            container.querySelector(`.${reaction}`).classList.toggle('hidden', added)
        } else {
            handlePostError(post)
        }
    }

    function handlePostError(post) {
        post.querySelector('.error-msg').classList.remove('hidden')
        setTimeout(() => post.querySelector('.error-msg').classList.add('hidden'), 2000)
    }
})