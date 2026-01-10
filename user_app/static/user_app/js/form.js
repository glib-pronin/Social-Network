document.addEventListener('DOMContentLoaded', () => {
    const switchers = document.querySelectorAll('.switcher-btn')
    const confirmPasswordBlock = document.getElementById('confirm-password-block')
    const sendBtn = document.getElementById('send-button')
    let switcherType = 'registration'

    switchers.forEach(btn => (
        btn.addEventListener('click', () => {
            switchers[0].classList.toggle('selected')
            switchers[1].classList.toggle('selected')
            if (switcherType === 'authorization') {
                switcherType = 'registration'
                confirmPasswordBlock.classList.remove('hidden')
                sendBtn.textContent = 'Створити акаунт'
            } else {
                switcherType = 'authorization'
                confirmPasswordBlock.classList.add('hidden')
                sendBtn.textContent = 'Увійти'
            }
        })
    ))

})