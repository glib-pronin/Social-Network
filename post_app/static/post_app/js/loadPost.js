let pageNum = 2

async function loadPost() {
    const postLoader = document.getElementById('post-loader')
    const postsContainer = document.getElementById('posts-container')
    const profileId = +(postLoader.dataset.id)

    
    if (postLoader && postLoader.dataset.hasMore === 'False') {
        postLoader.remove()
        return
    }
    
    const url = isNaN(profileId) ? `/get-posts?page=${pageNum}` : `/get-posts?page=${pageNum}&id=${profileId}`
    const res = await fetch(url)
    const { html_post, has_next } = await res.json()
    if (!has_next) {
        postLoader?.remove()
    } else if (has_next && !postLoader) {
        const div = document.createElement('div')
        div.id = 'post-loader'
        postsContainer.parentElement.append(div)
        setObserver(div)
    }
    postsContainer.innerHTML += html_post
    pageNum++
}

function setObserver(elem) {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting){
            loadPost()
        }
    }, options = {rootMargin: '250px'})

    observer.observe(elem)
}

document.addEventListener('DOMContentLoaded', () => {
    const postLoader = document.getElementById('post-loader')
   setObserver(postLoader)
})