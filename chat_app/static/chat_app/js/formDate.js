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