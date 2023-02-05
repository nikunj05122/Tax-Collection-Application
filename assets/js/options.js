module.exports = {
    formate: 'A4',
    orientation: 'portrait',
    border: '1mm',
    header: {
        height: '0mm',
        contents: ''
    },
    footer: {
        height: '0mm',
        contents: {
            first: '1 page',
            2: 'Second page',
            default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>',
            last: 'Last Page'
        }
    }
}