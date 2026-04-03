function createTempMsg({ text, images, tempId}) {
    const container = document.createElement('div')
    container.classList.add('msg-container')
    
    const msg = document.createElement('div')
    msg.classList.add('msg', 'my-msg')
    msg.dataset.tempId = tempId
    msg.dataset.date = getCurrentDate()

    const msgWrapper = document.createElement('div')
    msgWrapper.classList.add('msg-wrapper')

    if (images.length > 0) {
        const imgsContainer = document.createElement('div')
        imgsContainer.classList.add('imgs-container')

        images.forEach(img => {
            const item = document.createElement('div')
            item.classList.add('temp-image-item')
            
            const image = document.createElement('img')
            image.src = img.previewUrl
            image.classList.add('blur')

            const spinner = document.createElement('div')
            spinner.classList.add('spinner')
            
            item.append(image, spinner)
            imgsContainer.append(item)
        })
        msgWrapper.append(imgsContainer)
    }
    const msgText = document.createElement('span')
    msgText.textContent = text
    msgText.classList.add('msg-text')
    msgWrapper.append(n=msgText)

    const date = document.createElement('span')
    date.classList.add('date')
    date.textContent = '...'

    msg.append(msgWrapper, date)
    container.append(msg)
    return container
}

function getCurrentDate() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}.${month}.${year}`
}