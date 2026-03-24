document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('check-new-posts')
  const postsContainer = document.getElementById('posts-container')
  const firstPost = document.querySelector('.post:first-child')
  let cursor = firstPost.dataset.postId

  btn.addEventListener('click', async () => {
    if (!cursor) return

    const cursorPost = document.querySelector('.post:first-child')
    const prevTop = cursorPost.getBoundingClientRect().top

    const res = await fetch(`get-posts?cursor=${cursor}&new_posts=${true}`)
    const { html_post, new_cursor } = await res.json()
    
    const wrapper = document.createElement('div')
    wrapper.innerHTML = html_post
    observeNewPosts(wrapper)
    postsContainer.prepend(...wrapper.children)
    initLightBox()
    
    const newTop = cursorPost.getBoundingClientRect().top
    
    window.scrollBy(0, newTop - prevTop)
    cursor = new_cursor ? new_cursor : cursor 
  })  
})
