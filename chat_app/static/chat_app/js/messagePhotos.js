document.addEventListener('DOMContentLoaded', () => {
    const triggerBtns = document.querySelectorAll('.trigger-file-loader')
    const fileInput = document.getElementById('msg-file-loader')
    const secondBlock = document.querySelector('.second-block')
    const previewPhotosModal = document.getElementById('preview-photos-modal')
    const defaultPhoto = document.querySelector('.add-more.img-container')
    const imagesGrid = previewPhotosModal.querySelector('.imgs-grid')
    const token = document.querySelector('input[name="csrfmiddlewaretoken"]')?.value

    triggerBtns.forEach(btn => btn.addEventListener('click', () => fileInput.click()))

    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files)
        files.forEach(file => createPreviewImage(file))
        previewPhotosModal.classList.remove('hidden')
        fileInput.value = ''
    })

    function createPreviewImage(file) {
        const container = document.createElement('div')
        container.classList.add('img-container')
        const img = document.createElement('img')
        const deletebtn = document.createElement('button')
        deletebtn.type = 'button'
        deletebtn.classList.add('delete-btn', 'tool-btn')
        deletebtn.append(createTrashIcon())
        container.append(img, deletebtn)

        const previewUrl = URL.createObjectURL(file)
        img.src = previewUrl
        container.imgObj = { file, previewUrl }
        imagesGrid.insertBefore(container, defaultPhoto)
    }

    secondBlock.uploadImages = async function() {
        const selectedImages = Array.from(imagesGrid.querySelectorAll('.img-container:not(.add-more)')).map((el, ind) => ({...el.imgObj, order: ind}))
        const id = this.dataset.selected
        const promises = selectedImages.map(im => upload(im.file, im.order, id))
        const uploaded = await Promise.all(promises)
        this.resetSelectedImages()
        return uploaded
    }

    async function upload(image, order, id) {
        const formData = new FormData()
        formData.append('image', image)
        const res = await fetch(`/chat/upload-image/${id}`, {
            method: 'POST',
            headers: {'X-CSRFToken': token},
            body: formData
        })
        const { success, url, publicId, width, height } = await res.json()
        if (!success) return {}
        return { url, publicId, width, height, order }
    }

    secondBlock.resetSelectedImages = function() {
        imagesGrid.querySelectorAll('.img-container:not(.add-more)').forEach(container => {
            if (container.imgObj?.previewUrl) URL.revokeObjectURL(container.imgObj.previewUrl)
            container.remove()
        })
    }

    secondBlock.hasImages = () => {
        return imagesGrid.children.length > 1
    }

    imagesGrid.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn')
        if (deleteBtn) {
            const container = deleteBtn.closest('.img-container')
            if (container.imgObj?.previewUrl) URL.revokeObjectURL(container.imgObj.previewUrl)
            container.remove()
        }
    })

    new Sortable(imagesGrid, {
        animation: 150,
        ghostClass: 'dragging',
        draggable: '.img-container:not(.add-more)',
        onMove: (evt) => {
            return !evt.related.classList.contains('add-more')
        },
        scroll: true,
        scrollSensitivity: 60, 
        scrollSpeed: 5,
        forceFallback: true
    })
})