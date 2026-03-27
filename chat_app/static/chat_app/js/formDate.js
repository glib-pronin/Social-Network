const monthNames = [
    'січня', 'лютого', 'березня', 'квітня', 'травня',
    'червня', 'липня', 'серпня', 'вересня', 'жовтня',
    'листопада', 'грудня' 
] 

function formatDate(dateStr) {
    const date = new Date(dateStr.split('.').toReversed().join('-'))
    const day = date.getDate()
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
}

function createDateEl(date) {
    const dateEl = document.createElement('span')
    dateEl.classList.add('msgs-group-date')
    dateEl.textContent = formatDate(date)
    return dateEl
}

function setDates(container, hasNew, extraMsg = null) {
    const msgs = Array.from(container.querySelectorAll('.msg'))
    if (extraMsg) msgs.push(extraMsg)
    console.log(msgs);
    
    if (msgs.length && !hasNew) container.insertBefore(createDateEl(msgs[0].dataset.date), msgs[0].parentElement)
    msgs.forEach((m, ind) => {
        const currentDate = m.dataset.date
        const nextMsg = msgs[ind+1]
        if (nextMsg) {
            const nextDate = nextMsg.dataset.date
            if (new Date(nextDate.split('.').toReversed().join('-')) > new Date(currentDate.split('.').toReversed().join('-'))) {
                if (container.contains(nextMsg.parentElement)) container.insertBefore(createDateEl(nextDate), nextMsg.parentElement)
                else container.append(createDateEl(nextDate))
            }
        }
    })
}