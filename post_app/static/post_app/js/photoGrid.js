
document.addEventListener('DOMContentLoaded', () => {
    const imageGrid = document.querySelector('.images-grid')
    const fileInput = document.getElementById('file-input')
    const form = document.getElementById('create-post')
    
    let rows = []
    form.imagesState = rows
    let draggedItem = null

    imageGrid.addEventListener('dragover', (e) => e.preventDefault())
    imageGrid.addEventListener('drop', (e) => {
        const target = e.target.closest('.image-item')
        if (!draggedItem || !target || target === draggedItem) return
        swapItems(draggedItem, target)
    })

    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files)
        files.forEach(file => addImage(file))
        fileInput.value = ''
    })

    function addImage(file) {
        let row = rows[rows.length-1]
        if (!row || row.items.length >= 3) {
            const rowDiv = document.createElement('div')
            rowDiv.classList.add('row')
            imageGrid.append(rowDiv)
            row = { rowDiv, items: [] }
            rows.push(row)
        }
        const item = createImageItem(file)
        item.draggable = true
        item.addEventListener('dragstart', (e) => draggedItem = item)
        item.addEventListener('dragend', () => draggedItem = null)
        row.items.push(item)
        row.rowDiv.append(item)
        normalize()
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
        
        const prevBtn = document.createElement("button")
        prevBtn.classList.add('prev-row', 'image-btn')
        prevBtn.type = 'button'
        prevBtn.append(createArrowIcon())
        prevBtn.addEventListener('click', () => movePrev(item))
        
        const nextBtn = document.createElement("button")
        nextBtn.classList.add('next-row', 'image-btn')
        nextBtn.type = 'button'
        nextBtn.append(createArrowIcon())
        nextBtn.addEventListener('click', () => moveNext(item))
        item.append(img, deleteBtn, prevBtn, nextBtn)
        return item
    }

    function removeImage(item) {
        const row = rows.find(r => r.items.includes(item))
        row.items.splice(row.items.indexOf(item), 1)
        URL.revokeObjectURL(item.querySelector('img').src)
        item.remove()
        normalize()
    }

    function moveNext(item, isRoot = true) {
        const rowInd = rows.findIndex(r => r.items.includes(item))
        if (rowInd === -1) return
        const row = rows[rowInd]
        const itemInd = row.items.indexOf(item)
        row.items.splice(itemInd, 1)
        item.remove()

        let nextRow = rows[rowInd+1]
        if (!nextRow) {
            const rowDiv = document.createElement('div')
            rowDiv.classList.add('row')
            imageGrid.append(rowDiv)
            nextRow = { rowDiv, items: [] }
            rows.push(nextRow)
        }
        nextRow.items.push(item)
        nextRow.rowDiv.append(item)

        if (nextRow.items.length > 3) moveNext(nextRow.items[2], false)
        if (isRoot) normalize()
    }
    
    function movePrev(item, isRoot = true) {
        const rowInd = rows.findIndex(r => r.items.includes(item))
        if (rowInd === -1) return
        const row = rows[rowInd]
        const itemInd = row.items.indexOf(item)
        row.items.splice(itemInd, 1)
        item.remove()
        
        let prevRow = rows[rowInd-1]
        if (!prevRow) {
            const rowDiv = document.createElement('div')
            rowDiv.classList.add('row')
            imageGrid.prepend(rowDiv)
            prevRow = { rowDiv, items: [] }
            rows.unshift(prevRow)
        }
        prevRow.items.unshift(item)
        prevRow.rowDiv.prepend(item)        
        if (prevRow.items.length > 3) movePrev(prevRow.items[1], false)
        if (isRoot) normalize()
    }

    function swapItems(from, to) {
        console.log('swap');
        
        if (from === to) return
        const fromRow = rows.find(r => r.items.includes(from))
        const toRow = rows.find(r => r.items.includes(to))
        if (!fromRow || !toRow) return
        const fromInd = fromRow.items.indexOf(from)
        const toInd = toRow.items.indexOf(to)
        fromRow.items[fromInd] = to
        toRow.items[toInd] = from
        const placeholder = document.createTextNode('')
        from.replaceWith(placeholder)
        to.replaceWith(from)
        placeholder.replaceWith(to)
        normalize()        
    }

    function normalize() {
        rows.forEach((row, rowInd) => {
            if (row.items.length === 0) {
                row.rowDiv.remove()
            }
            row.items.forEach((item, ind) => {
                const prevCondition = rowInd === 0 && row.items.length === 1
                const nextCondition = rowInd === rows.length-1 && row.items.length === 1             
                item.querySelector('.prev-row').classList.toggle('hidden', (ind !== 0 || prevCondition))
                item.querySelector('.next-row').classList.toggle('hidden', (ind !== row.items.length-1 || nextCondition))
            })
        })
        rows = rows.filter(row => row.items.length !== 0)
    }

    function createTrashIcon() {
        const svgNS = 'http://www.w3.org/2000/svg'
        const svg = createBaseSVG()
        const path = document.createElementNS(svgNS, 'path')
        path.setAttribute('d', 'M3.33301 5.83333H16.6663M8.33301 9.16667V14.1667M11.6663 9.16667V14.1667M4.16634 5.83333L4.99967 15.8333C4.99967 16.2754 5.17527 16.6993 5.48783 17.0118C5.80039 17.3244 6.22431 17.5 6.66634 17.5H13.333C13.775 17.5 14.199 17.3244 14.5115 17.0118C14.8241 16.6993 14.9997 16.2754 14.9997 15.8333L15.833 5.83333M7.49967 5.83333V3.33333C7.49967 3.11232 7.58747 2.90036 7.74375 2.74408C7.90003 2.5878 8.11199 2.5 8.33301 2.5H11.6663C11.8874 2.5 12.0993 2.5878 12.2556 2.74408C12.4119 2.90036 12.4997 3.11232 12.4997 3.33333V5.83333')
        path.setAttribute('stroke', '#543C52')
        path.setAttribute('stroke-width', '1.66667')
        path.setAttribute('stroke-linecap', 'round')
        path.setAttribute('stroke-linejsoin', 'round')
        svg.append(path)
        return svg
    }

    function createArrowIcon() {
        const svgNS = 'http://www.w3.org/2000/svg'
        const svg = createBaseSVG()
        const path = document.createElementNS(svgNS, 'path')
        path.setAttribute('d', 'M9 2.5C9 1.94772 9.44772 1.5 10 1.5C10.5523 1.5 11 1.94772 11 2.5H10H9ZM10.7071 18.2071C10.3166 18.5976 9.68342 18.5976 9.29289 18.2071L2.92893 11.8431C2.53841 11.4526 2.53841 10.8195 2.92893 10.4289C3.31946 10.0384 3.95262 10.0384 4.34315 10.4289L10 16.0858L15.6569 10.4289C16.0474 10.0384 16.6805 10.0384 17.0711 10.4289C17.4616 10.8195 17.4616 11.4526 17.0711 11.8431L10.7071 18.2071ZM10 2.5H11V17.5H10H9V2.5H10Z')
        path.setAttribute('fill', '#543C52')
        svg.append(path)
        return svg
    }

    function createBaseSVG() {
        const svgNS = 'http://www.w3.org/2000/svg'
        const svg = document.createElementNS(svgNS, 'svg')
        svg.setAttribute('width', '20')
        svg.setAttribute('height', '20')
        svg.setAttribute('viewBox', '0 0 20 20')
        svg.setAttribute('fill', 'none')
        return svg
    }
})