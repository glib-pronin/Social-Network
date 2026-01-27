function showError(msg, show=false) {
    const errorContainer = document.getElementById('verify-email').querySelector('.error-msg')
    errorContainer.textContent = msg
    errorContainer.classList.toggle('hidden', show)
}

async function sendCode() {
    console.log('...');
    const res = await fetch('send-code', {
        method: 'POST',
        headers: {"Content-Type": "application/json", "X-CSRFToken": document.getElementById('auth-form').elements.csrfmiddlewaretoken.value},
        body: JSON.stringify()
    })
    const { success } = await res.json()
    if (!success) {
        showError('Сталася помилка під час відправки коду, спробуйте пізніше!', true)
    }
}