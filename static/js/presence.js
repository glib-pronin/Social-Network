const protocol = window.location.protocol === 'https' ? 'wss' : 'ws'
const url = `${protocol}://${window.location.host}/presence`
let presenceWs = new WebSocket(url)

presenceWs.onmessage = async (e) => {
    const data = JSON.parse(e.data)
    console.log(data);
    
    const users = document.querySelectorAll('.user-presence')
    console.log(users);
    
    users.forEach(us => {
        const id = us.dataset.id

        if (id == data.user_id) {
            us.classList.toggle('online', data.status === 'online')
        }
    })
    
}