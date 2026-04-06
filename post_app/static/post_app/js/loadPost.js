let cursor = null

async function loadPost() {
    const postLoader = document.getElementById('post-loader')
    const postsContainer = document.getElementById('posts-container')
    const profileId = +(postLoader.dataset.id)
    
    if (postLoader && postLoader.dataset.hasMore === 'False') {
        postLoader.remove()
        return
    }
    const urlName = postsContainer.dataset.urlName
    const url = isNaN(profileId) ? `/get-posts?cursor=${cursor}&url_name=${urlName}` : `/get-posts?cursor=${cursor}&id=${profileId}&url_name=${urlName}`
    const res = await fetch(url)
    const { success, html_post, has_next, new_cursor } = await res.json()
    if (success) {
        if (!has_next) {
            postLoader?.remove()
        } else if (has_next && !postLoader) {
            const div = document.createElement('div')
            div.id = 'post-loader'
            postsContainer.parentElement.append(div)
            setObserver(div)
        }
        const wrapper = document.createElement('div')
        wrapper.innerHTML = html_post
        observeNewPosts(wrapper)
        registerIndicators(wrapper)
        postsContainer.append(...wrapper.children)
        initLightBox()
        cursor = new_cursor
    }
}

function setObserver(elem) {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting){
            loadPost()
        }
    },{rootMargin: '250px'})

    observer.observe(elem)
}

const viewsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const postId = entry.target.dataset.postId

            fetch(`/add-post-view/${postId}`, {
                method: 'POST',
                headers: { 'X-CSRFToken': document.querySelector('input[name="csrfmiddlewaretoken"]').value }
            })

            entry.target.dataset.viewed = 'true'
            viewsObserver.unobserve(entry.target)
        }
    })
}, { threshold: 0.3 })

function observeNewPosts(container) {
    const posts = container.querySelectorAll('.post:not([data-viewed="true"])')
    posts.forEach(post => viewsObserver.observe(post))
}

document.addEventListener('DOMContentLoaded', () => {
    const postLoader = document.getElementById('post-loader')
    cursor = postLoader.dataset.cursor
    
    setObserver(postLoader)
    observeNewPosts(document.getElementById('posts-container'))
})