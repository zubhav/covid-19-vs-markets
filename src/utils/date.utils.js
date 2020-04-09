export const padZero = (num) => (num < 10 && num >= 0 ? `0${num}` : `${num}`)

export const getDateFromTimestamp = (timestamp) => {
    const dateObj = new Date(timestamp * 1000)
    const year = dateObj.getFullYear()
    const month = padZero(dateObj.getMonth() + 1)
    const day = padZero(dateObj.getDate())
    return `${day}/${month}/${year}`
}
