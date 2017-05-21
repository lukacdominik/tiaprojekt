export const parseDurationFromSeconds = (sec) => {
	const seconds = sec % 60 | 0
	const minutes = (sec / 60) % 60 | 0
	const hours = (sec / 60 / 60) % 24 | 0
	const days = (sec / 60 / 60 / 24) | 0
	return (
		(days > 1 ? `${days} days ` : days === 1 ? '1 day ' : '')
		+ (hours > 0 ? `${hours}:` : '')
		+ (minutes >= 10 ? `${minutes}:` : `0${minutes}:`)
		+ (seconds >= 10 ? `${seconds}` : `0${seconds}`)
	)
}

export const parseDuration = (str) => {
	if (typeof str !== 'string' || str.length === 0 || str[0] !== 'P') {
		return 0
	}
	var rest = str.slice(1)
	var [days, rest] = rest.split('D')
	if (typeof rest === 'undefined') {
		rest = days
		days = 0
	}
	days |= 0
	if (rest[0] === 'T') {
		rest = rest.slice(1)
	}
	var [hours, rest] = rest.split('H')
	if (typeof rest === 'undefined') {
		rest = hours
		hours = 0
	}
	hours |= 0
	var [minutes, rest] = rest.split('M')
	if (typeof rest === 'undefined') {
		rest = minutes
		minutes = 0
	}
	minutes |= 0
	var seconds = rest.split('S')[0]
	seconds |= 0
	return (((days * 24 + hours) * 60 + minutes) * 60 + seconds)
}


export const parseVideoId = (video_url) => {
	const urlParts = video_url.split('?')
	if (urlParts.length < 2) {
		return null
	}
	const videoId = urlParts[1].split('&').reduce((acc, query) => {
		const [key, val] = query.split('=')
		return key === 'v' ? val : acc
	}, null)
	return videoId
}
