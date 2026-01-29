document.addEventListener('DOMContentLoaded', () => {
    const openEditionBtn = document.getElementById('edit-block-btn')
    const cancelEditionBtn = document.getElementById('cancel-block-btn')
    const editSignatureBtn = document.getElementById('edit-signature-btn')
    const saveSignatureBtn = document.getElementById('update-signature-btn')
    const canvas = document.getElementById('signature-canvas')
    const editorBtns = document.getElementById('editor-btns')
    const image = document.getElementById('signature-photo')
    const msgError = document.getElementById('end-error')
    const textCheckbox = document.getElementById('text-checkbox')
    const imageCheckbox = document.getElementById('image-checkbox')
    const token = document.querySelector('input[name="csrfmiddlewaretoken"]').value

    let originalSrc = image.src
    let originalText = textCheckbox.checked
    let originalImage = imageCheckbox.checked
    let signaturePad = null
    let signatureBlob = null
    let isChanging = false

    openEditionBtn.addEventListener('click', () => {
        openEditionBtn.classList.add('hidden')
        openEditionBtn.nextElementSibling.classList.remove('hidden')
        editSignatureBtn.classList.remove('hidden')
        const dataContainer = openEditionBtn.parentElement.nextElementSibling
        dataContainer.querySelectorAll('.data-container').forEach(dc => dc.classList.remove('disabled'))
        dataContainer.parentElement.classList.add('highlighted-border')
        dataContainer.querySelectorAll('input').forEach(input => {
            input.disabled = false
        })
    })

    cancelEditionBtn.addEventListener('click', () => {
        openEditionBtn.classList.remove('hidden')
        openEditionBtn.nextElementSibling.classList.add('hidden')
        editSignatureBtn.classList.add('hidden')
        const dataContainer = openEditionBtn.parentElement.nextElementSibling
        dataContainer.querySelectorAll('.data-container').forEach(dc => dc.classList.add('disabled'))
        dataContainer.parentElement.classList.remove('highlighted-border')
        dataContainer.querySelectorAll('input').forEach(input => {
            input.disabled = true
        })
        editorBtns.classList.add('hidden')
        canvas.classList.add('hidden')
        image.src = originalSrc
        image.classList.remove('not-saved')
        image.classList.remove('hidden')
        if (!originalSrc) image.classList.add('hidden')
        signatureBlob = null
        msgError.classList.add('hidden')
        textCheckbox.checked = originalText
        imageCheckbox.checked = originalImage
    })

    saveSignatureBtn.addEventListener('click', async () => {
        if (isChanging) {
            msgError.classList.remove('hidden')
            msgError.textContent ='Завершіть редагування підпису'
            return
        }
        if (!signatureBlob && textCheckbox.checked === originalText && imageCheckbox.checked === originalImage) {
            cancelEditionBtn.click()
            return
        }
        const formData = new FormData()
        if (signatureBlob) formData.append('signature', signatureBlob, `signature_${Date.now()}.png`)
        if (textCheckbox.checked !== originalText) formData.append('is_text_signature', textCheckbox.checked)
        if (imageCheckbox.checked !== originalImage) formData.append('is_image_signature', imageCheckbox.checked)
        const res = await fetch('/profile/update-signature', {
            method: 'POST', 
            headers: {'X-CSRFToken': token},
            body: formData
        })
        const { url, is_text_signature, is_image_signature } = await res.json()
        originalSrc = url
        originalImage = is_image_signature
        originalText = is_text_signature
        cancelEditionBtn.click()
    })

    function resizeCanvas() {
        const ratio = Math.max(window.devicePixelRatio || 1, 1)
        canvas.width = canvas.offsetWidth * ratio
        canvas.height = canvas.offsetHeight * ratio
        canvas.getContext('2d').scale(ratio, ratio)
    }

    function initSignaturePad() {
        resizeCanvas()
        signaturePad = new SignaturePad(canvas)
        signaturePad.addEventListener('beginStroke', () => msgError.classList.add('hidden'))
    }

    function showEditor() {
        canvas.classList.remove('hidden')
        editorBtns.classList.remove('hidden')
        editSignatureBtn.classList.add('hidden')
        image.classList.add('hidden')
        if (!signaturePad) initSignaturePad()
        else signaturePad.clear()
        isChanging = true
    }
    
    function showPreview() {
        canvas.classList.add('hidden')
        editorBtns.classList.add('hidden')
        editSignatureBtn.classList.remove('hidden')
        image.classList.remove('hidden')
        image.classList.add('not-saved')
        image.src = URL.createObjectURL(signatureBlob)
        isChanging = false
        msgError.classList.add('hidden')
    }

    editSignatureBtn.addEventListener('click', () => showEditor())

    editorBtns.querySelector('#clear-btn').addEventListener('click', () => signaturePad.clear())
    editorBtns.querySelector('#save-signature-btn').addEventListener('click', async () => {
        if (signaturePad.isEmpty()) {
            msgError.classList.remove('hidden')
            msgError.textContent ='Намалюйте підпис'
            return
        }
        const dataUrl = signaturePad.toDataURL('image/png')
        signatureBlob = await (await fetch(dataUrl)).blob()
        showPreview()
    })
})