document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('check-new-posts')
  const defaultBlock = document.getElementById('show-new-posts')
  const loadingBlock = document.getElementById('searching-new-posts')
  const failuretBlock = document.getElementById('failure-searching')
  const postsContainer = document.getElementById('posts-container')
  const firstPost = document.querySelector('.post:first-child')
  let cursor = firstPost.dataset.postId
  let isLoading = false

  btn.addEventListener('click', async () => {
    if (!cursor || isLoading) return

    btn.classList.remove('cursor-pointer')
    defaultBlock.classList.add('hidden')
    loadingBlock.classList.remove('hidden')
    isLoading = true
    const cursorPost = document.querySelector('.post:first-child')
    const prevTop = cursorPost.getBoundingClientRect().top
    
    const res = await fetch(`get-posts?cursor=${cursor}&new_posts=${true}`)
    const { html_post, new_cursor } = await res.json()
    loadingBlock.classList.add('hidden')
    if (!new_cursor) failuretBlock.classList.remove('hidden')    
    setTimeout(() => {
      failuretBlock.classList.add('hidden')
      defaultBlock.classList.remove('hidden')
      btn.classList.add('cursor-pointer')
      isLoading = false
    }, 2000)
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
