document.addEventListener('DOMContentLoaded', () => {
    const lightbox = new PhotoSwipeLightbox({
        gallery: '.post-gallery',
        children: 'a',
        pswpModule: PhotoSwipe
    })

    lightbox.init()
})