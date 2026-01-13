function validateFields(email, password, confirmPassword, errorContainer, checkConfirmation) {
    if (!email || !password || (!confirmPassword && checkConfirmation)) {
        errorContainer.classList.remove('hidden')
        errorContainer.textContent = 'Заповінть усі поля'
        return false
    }
    if (!/^[a-zA-Z0-9+_%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        return false
    }
    if (password.length < 6) {
        return false
    } 
    if (confirmPassword !== password && checkConfirmation) {
        return false
    }
    errorContainer.classList.add('.hidden')
    return true
}