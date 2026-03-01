
document.addEventListener('DOMContentLoaded', () => {
    const imageGrid = document.querySelector('.images-grid')
    const fileInput = document.getElementById('file-input')
    const form = document.getElementById('create-post')
    
    const pattern = [3, 2]
    let imagesState = []

    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files)
        files.forEach(file => addImage(file))
        fileInput.value = ''
    })

    function addImage(file) {
        const item = createImageItem(file)
        imageGrid.append(item)
        normalizePattern()
    }

    function createImageItem(file) {
        const item = document.createElement('div')
        item.classList.add('image-item')
        item.file = file
        
        const img = document.createElement('img')
        img.src = URL.createObjectURL(file)

        const deleteBtn = document.createElement('button')
        deleteBtn.append(createTrashIcon())
        deleteBtn.type = 'button'
        deleteBtn.classList.add('delete-image', 'image-btn')
        deleteBtn.addEventListener('click', () => removeImage(item))
        
        item.append(img, deleteBtn)
        return item
    }

    function removeImage(item) {
        URL.revokeObjectURL(item.querySelector('img').src)
        item.remove()
        normalizePattern()
    }

    function normalizePattern() {
        const items = Array.from(imageGrid.querySelectorAll('.image-item'))
        imagesState = []
        
        let patternIndex = 0
        let currentLimit = pattern[patternIndex]
        let countInRow = 0
        let rowNumber = 0

        items.forEach(item => {
            item.classList.remove('row-2', 'row-3')

            if (countInRow >= currentLimit) {
                patternIndex++
                currentLimit = pattern[patternIndex % pattern.length]
                countInRow = 0
                rowNumber++
            }
            item.classList.add(`row-${currentLimit}`)
            imagesState.push({
                row: rowNumber,
                col: countInRow,
                file: item.file,
            })
            countInRow++
        }) 
        form.imagesState = imagesState
    }

    new Sortable(imageGrid, {
        animation: 150,
        ghostClass: 'dragging',
        onEnd: () => normalizePattern()
    })
})