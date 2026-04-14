const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
const url = `${protocol}://${window.location.host}/presence`
let presenceWs = new WebSocket(url)

const userPresenceIndicators = new Map()
let onlineUsers = new Set()

presenceWs.onmessage = async (e) => {
    const data = JSON.parse(e.data)
    const type = data.type
    if (type === 'send_notif') {
        if (!data.isRequestNotification && typeof addMsgToSideChat === 'function') addMsgToSideChat(data)
        if (!data.isMyMsg || data.isRequestNotification) showNotification(data)
    } else {
        const user_id = String(data.user_id)
    
        if (data.status === 'online') onlineUsers.add(user_id)
        else onlineUsers.delete(user_id)    
    
        const elements = userPresenceIndicators.get(user_id)
        if (!elements) return
    
        for (let i = elements.length - 1; i >= 0; i--) {
            const el = elements[i]
            if (el.isConnected) {
                el.classList.toggle('online', data.status === 'online')
            } else {
                elements.splice(i, 1)
            }
        }
        if (typeof setOnlineMembersCount === 'function') setOnlineMembersCount()
    }
}

function registerIndicators(root = document) {
    const avatars = root.querySelectorAll('.user-presence')
    console.log(avatars);
    
    avatars.forEach(el => {
        const id = el.dataset.id
        if (!id) return

        if (!userPresenceIndicators.has(id)) userPresenceIndicators.set(id, [])
        const list = userPresenceIndicators.get(id)
        if (!list.includes(el)) list.push(el)
        
        if (onlineUsers.has(id)) el.classList.add('online')
    })
}

function removeIndicator(indicator) {
    const id = indicator.dataset.id
    if (!id) return
    const list = userPresenceIndicators.get(id)
    if (!list) return
    const index = list.indexOf(indicator)
    if(index !== -1) {
        list.splice(index, 1)
    }    
}

async function loadInitialOnlineUsers() {
    const res = await fetch('/profile/get-online-users')
    const data = await res.json()
    data.online_users.forEach(id => onlineUsers.add(id))
}

loadInitialOnlineUsers().then(res => registerIndicators())