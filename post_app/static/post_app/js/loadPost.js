document.addEventListener('DOMContentLoaded', () => {
    const postLoader = document.getElementById('post-loader')
    const postsContainer = document.getElementById('posts-container')
    let pageNum = 2

    async function loadPost() {
        console.log('loading...');
        
        const res = await fetch(`/get-posts?page=${pageNum}`)
        const { html_post, has_next } = await res.json()
        if (!has_next) {
            postLoader.remove()
        }
        postsContainer.innerHTML += html_post
        pageNum++
    }
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting){
            loadPost()
        }
    }, options = {rootMargin: '250px'})
    observer.observe(postLoader)
})