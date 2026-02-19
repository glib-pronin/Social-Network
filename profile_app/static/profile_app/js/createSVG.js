const svgNS = 'http://www.w3.org/2000/svg'

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