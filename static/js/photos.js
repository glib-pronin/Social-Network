let lightbox

function initLightBox() {
    lightbox?.destroy()
    lightbox = new PhotoSwipeLightbox({
        gallery: '.post-gallery',
        children: 'a',
        pswpModule: PhotoSwipe
    })

    lightbox.init()
}

document.addEventListener('DOMContentLoaded', () => {
   initLightBox()
})