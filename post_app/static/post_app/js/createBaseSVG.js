const svgNS = 'http://www.w3.org/2000/svg'

function createBaseSVG() {
    const svg = document.createElementNS(svgNS, 'svg')
    svg.setAttribute('width', '20')
    svg.setAttribute('height', '20')
    svg.setAttribute('viewBox', '0 0 20 20')
    svg.setAttribute('fill', 'none')
    return svg
}

function createTrashIcon() {
    const svg = createBaseSVG()
    const path = document.createElementNS(svgNS, 'path')
    path.setAttribute('d', 'M3.33301 5.83333H16.6663M8.33301 9.16667V14.1667M11.6663 9.16667V14.1667M4.16634 5.83333L4.99967 15.8333C4.99967 16.2754 5.17527 16.6993 5.48783 17.0118C5.80039 17.3244 6.22431 17.5 6.66634 17.5H13.333C13.775 17.5 14.199 17.3244 14.5115 17.0118C14.8241 16.6993 14.9997 16.2754 14.9997 15.8333L15.833 5.83333M7.49967 5.83333V3.33333C7.49967 3.11232 7.58747 2.90036 7.74375 2.74408C7.90003 2.5878 8.11199 2.5 8.33301 2.5H11.6663C11.8874 2.5 12.0993 2.5878 12.2556 2.74408C12.4119 2.90036 12.4997 3.11232 12.4997 3.33333V5.83333')
    path.setAttribute('stroke', '#543C52')
    path.setAttribute('stroke-width', '1.66667')
    path.setAttribute('stroke-linecap', 'round')
    path.setAttribute('stroke-linejsoin', 'round')
    svg.append(path)
    return svg
}

function createHideSVG() {
    const svg = createBaseSVG()

    const g = document.createElementNS(svgNS, 'g')

    const path1 = document.createElementNS(svgNS, "path")
    path1.setAttribute("d", "M1.66602 10.0003C1.66602 10.0003 4.16602 4.16699 9.99935 4.16699C15.8327 4.16699 18.3327 10.0003 18.3327 10.0003C18.3327 10.0003 15.8327 15.8337 9.99935 15.8337C4.16602 15.8337 1.66602 10.0003 1.66602 10.0003Z")
    path1.setAttribute("stroke", "#543C52")
    path1.setAttribute("stroke-width", "2")
    path1.setAttribute("stroke-linecap", "round")
    path1.setAttribute("stroke-linejoin", "round")

    const path2 = document.createElementNS(svgNS, "path")
    path2.setAttribute("d", "M9.99935 12.5003C11.3801 12.5003 12.4993 11.381 12.4993 10.0003C12.4993 8.61961 11.3801 7.50033 9.99935 7.50033C8.61864 7.50033 7.49935 8.61961 7.49935 10.0003C7.49935 11.381 8.61864 12.5003 9.99935 12.5003Z")
    path2.setAttribute("stroke", "#543C52")
    path2.setAttribute("stroke-width", "2")
    path2.setAttribute("stroke-linecap", "round")
    path2.setAttribute("stroke-linejoin", "round")

    g.appendChild(path1)
    g.appendChild(path2)
    svg.appendChild(g)
    return svg
}

function createShowSVG() {
    const svg = createBaseSVG()
    const g = document.createElementNS(svgNS, 'g')
    const path1 = document.createElementNS(svgNS, "path")
    path1.setAttribute("d", "M8.23268 8.23317C7.98706 8.46204 7.79005 8.73805 7.65341 9.04471C7.51677 9.35137 7.4433 9.68242 7.43738 10.0181C7.43145 10.3538 7.4932 10.6872 7.61894 10.9985C7.74468 11.3098 7.93182 11.5926 8.16922 11.83C8.40662 12.0674 8.6894 12.2545 9.00069 12.3802C9.31198 12.506 9.64541 12.5677 9.98109 12.5618C10.3168 12.5559 10.6478 12.4824 10.9545 12.3458C11.2611 12.2091 11.5371 12.0121 11.766 11.7665M8.94102 4.23317C9.29211 4.18943 9.64554 4.16716 9.99935 4.1665C15.8327 4.1665 18.3327 9.99984 18.3327 9.99984C17.9601 10.7974 17.4929 11.5473 16.941 12.2332M5.50768 5.50817C3.85039 6.63702 2.52424 8.18755 1.66602 9.99984C1.66602 9.99984 4.16602 15.8332 9.99935 15.8332C11.5959 15.8375 13.1583 15.3708 14.491 14.4915M1.66602 1.6665L18.3327 18.3332")
    path1.setAttribute("stroke", "#543C52")
    path1.setAttribute("stroke-width", "2")
    path1.setAttribute("stroke-linecap", "round")
    path1.setAttribute("stroke-linejoin", "round")

    g.appendChild(path1)
    svg.appendChild(g)
    return svg
}