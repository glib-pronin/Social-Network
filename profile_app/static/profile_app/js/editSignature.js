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
    const pseudonymInput = document.getElementById('pseudonym')
    const token = document.querySelector('input[name="csrfmiddlewaretoken"]').value

    let originalSrc = image.src
    let originalText = textCheckbox.checked
    let originalImage = imageCheckbox.checked
    let originalPseudonym = pseudonymInput.value
    let signaturePad = null
    let signatureBlob = null
    let isChanging = false
    let tempObjectURL = null

    openEditionBtn.addEventListener('click', () => editSignatureBtn.classList.remove('hidden'))

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
        pseudonymInput.value = originalPseudonym
        pseudonymInput.nextElementSibling.classList.add('hidden')
        editorBtns.classList.add('hidden')
        canvas.classList.add('hidden')
        image.src = originalSrc
        image.classList.remove('not-saved')
        image.classList.remove('hidden')
        if (!originalSrc) image.classList.add('hidden')
        signatureBlob = null
        msgError.classList.add('hidden')
        textCheckbox.checked = originalText
        if (signatureBlob) {
            URL.revokeObjectURL(tempObjectURL)
            tempObjectURL = null
        } 
    })

    saveSignatureBtn.addEventListener('click', async () => {
        if (isChanging) {
            msgError.classList.remove('hidden')
            msgError.textContent ='Завершіть редагування підпису'
            return
        }
        if (!signatureBlob && textCheckbox.checked === originalText && imageCheckbox.checked === originalImage && pseudonymInput.value === originalPseudonym) {
            cancelEditionBtn.click()
            return
        }
        if (!checkPseudonym()) return
        const formData = new FormData()
        if (signatureBlob) {
            formData.append('signature', signatureBlob, `signature_${Date.now()}.png`)
            URL.revokeObjectURL(tempObjectURL)
            tempObjectURL = null
        } 
        if (pseudonymInput.value !== originalPseudonym) formData.append('pseudonym', pseudonymInput.value)
        if (textCheckbox.checked !== originalText) formData.append('is_text_signature', textCheckbox.checked)
        if (imageCheckbox.checked !== originalImage) formData.append('is_image_signature', imageCheckbox.checked)
        const res = await fetch('/profile/update-signature', {
            method: 'POST', 
            headers: {'X-CSRFToken': token},
            body: formData
        })
        const { url, is_text_signature, is_image_signature, pseudonym } = await res.json()
        originalSrc = url
        originalImage = is_image_signature
        originalText = is_text_signature
        originalPseudonym = pseudonym
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
        if (tempObjectURL) URL.revokeObjectURL(tempObjectURL)
        tempObjectURL = URL.createObjectURL(signatureBlob)
        image.src = tempObjectURL
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

    const MAX_LENGTH = 20
    const MIN_LENGTH = 3

    pseudonymInput.addEventListener('input', () => {
        let value = pseudonymInput.value
        value = value.replaceAll(/[^a-zA-Z0-9а-яА-ЯёЁіІїЇєЄґҐ_. ]/g, '')
        value = value.replaceAll(/[ _]{2,}/g, ' ')
        if (value.length > MAX_LENGTH) {
            value = value.slice(0, MAX_LENGTH)
        }
        pseudonymInput.value = value
        console.log(checkPseudonym())
    })

    function checkPseudonym() {
        const value = pseudonymInput.value
        if (value.length > MAX_LENGTH || value.length < MIN_LENGTH || !/^(?!\d+$)[a-zA-Z0-9а-яА-ЯёЁіІїЇєЄґҐ]+([ _][a-zA-Z0-9а-яА-ЯёЁіІїЇєЄґҐ]+)*$/.test(value)) {
            pseudonymInput.nextElementSibling.classList.remove('hidden')
            return false
        }
        pseudonymInput.nextElementSibling.classList.add('hidden')
        return true
    }
})