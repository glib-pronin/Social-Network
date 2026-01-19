document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('auth-form')
    const emailForm = document.getElementById('verify-email')
    const switchers = document.querySelectorAll('.switcher-btn')
    const confirmPasswordBlock = document.getElementById('confirm-password-block')
    const sendBtn = document.getElementById('send-button')
    const formText = document.querySelector('.form-text')
    const token = form.elements.csrfmiddlewaretoken.value
    const emailField = form.elements.email 
    const passwordField = form.elements.password
    const confirmPasswordField = form.elements.confirmPassword
    const mainError = form.querySelector('.main-error')
    let switcherType = 'registration'

    const verifyEmail = sessionStorage.getItem('verify-email')
    if (verifyEmail) {
        form.classList.add('hidden')
        emailForm.classList.remove('hidden')
        emailForm.querySelector('#user-email').textContent = verifyEmail 
    }

    emailField.addEventListener('input', () => {
        emailField.nextElementSibling.classList.add('hidden')
        if (!/^[a-zA-Z0-9+_%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailField.value) && emailField.value){
            emailField.nextElementSibling.classList.remove('hidden')
        }
    })

    passwordField.addEventListener('input', () => {
        if (passwordField.value.length < 6 && passwordField.value && switcherType === 'registration') {
            passwordField.nextElementSibling.classList.remove('hidden')
        } else {
            passwordField.nextElementSibling.classList.add('hidden')
        }
    })
    passwordField.addEventListener('input', checkPasswords)
    confirmPasswordField.addEventListener('input', checkPasswords)
    
    emailField.addEventListener('input', () => checkAllFields(emailField.value, passwordField.value, confirmPasswordField.value))
    passwordField.addEventListener('input', () => checkAllFields(emailField.value, passwordField.value, confirmPasswordField.value))
    confirmPasswordField.addEventListener('input', () => checkAllFields(emailField.value, passwordField.value, confirmPasswordField.value))

    function checkPasswords() {
        if (!confirmPasswordField.value || confirmPasswordField.value === passwordField.value) {
            confirmPasswordField.nextElementSibling.classList.add('hidden')
        } else {
            confirmPasswordField.nextElementSibling.classList.remove('hidden')
        }
    }

    function checkAllFields(email, password, confirmPassword) {
        if (email && password && (confirmPassword || switcherType === 'authorization')) {
            mainError.classList.add('hidden')
        }
    }


    switchers.forEach(btn => (
        btn.addEventListener('click', () => {
            mainError.classList.add('hidden')
            switcherType = btn.dataset.type
            switchers.forEach(b => b.classList.remove('selected'))
            btn.classList.add('selected')
            if (switcherType === 'registration') {
                btn.parentElement.classList.remove('auth')
                confirmPasswordBlock.classList.remove('hidden')
                sendBtn.textContent = 'Створити акаунт'
                formText.textContent = 'Приєднуйся до World IT'
            } else {
                btn.parentElement.classList.add('auth')
                confirmPasswordBlock.classList.add('hidden')
                sendBtn.textContent = 'Увійти'
                formText.textContent = 'Раді тебе знову бачити!'
            }
        })
    ))

    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        const email = form.elements.email.value
        const password = form.elements.password.value
        const confirmPassword = form.elements.confirmPassword.value
        const isValid = validateFields(email, password, confirmPassword, mainError, switcherType === 'registration')
        if (!isValid) return
        if (switcherType === "registration") {
            sendForm(
                '/registration', 
                {email, password, confirmPassword},
                handleRegistration
            )
        } else {
            sendForm(
                '/login', 
                {email, password},
                handleAuthorization
            )
        }
    })
    
    async function sendForm(url, bodyData, handleResult) {
        showSpinner(true, form)
        const res = await fetch(url, {
            method: 'POST',
            headers: {"Content-Type": "application/json", "X-CSRFToken": token},
            body: JSON.stringify(bodyData)
        })
        const data = await res.json()
        console.log(data);
        handleResult(data)
        showSpinner(false, form)
    }

    function handleRegistration({ success, error, email }) {
        if (success) {
            form.classList.add('hidden')
            emailForm.classList.remove('hidden')
            emailForm.querySelector('#user-email').textContent = email
            sessionStorage.setItem('verify-email', email)
            sendCode()
        } else {
            if (error === 'user_exists') {
                mainError.textContent = 'Користувач з такою поштою вже існує'
            } else {
                mainError.textContent = 'Сталася помилка під час обробки даних'
            }
            mainError.classList.remove('hidden')
        }
    }

    function handleAuthorization({ success, error, email }) {
        if (success) {
            location.href = '/'
        } else if (error === 'verify_email') {
            form.classList.add('hidden')
            emailForm.classList.remove('hidden')
            emailForm.querySelector('#user-email').textContent = email
            sessionStorage.setItem('verify-email', email)
            sendCode()
        } else {
            if (error === 'incorrect_credentials') {
                mainError.textContent = 'Неправильна пошта або пароль'
            } else {
                mainError.textContent = 'Сталася помилка під час обробки даних'
            }
            mainError.classList.remove('hidden')
        }
    }

})