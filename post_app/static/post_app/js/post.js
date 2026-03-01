document.addEventListener('DOMContentLoaded', () => {
    const postsContainer = document.getElementById('posts-container')
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
            }
        } else if (e.target.closest('.like')) {
            toggleReaction('like', e.target.closest('.like'))
        } else if (e.target.closest('.heart')) {
            toggleReaction('heart', e.target.closest('.heart'))
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
            btn.classList.toggle('selected', added)
            btn.closest('.info').querySelector('.count').textContent = count
        }
    }
})