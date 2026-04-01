const fileInput = document.getElementById('fileInput')
const colsInput = document.getElementById('cols')
const rowsInput = document.getElementById('rows')
const keepAspectCheck = document.getElementById('keepAspect')
const printBtn = document.getElementById('printBtn')
const pagesCountSpan = document.getElementById('pagesCount')

fileInput.value = '';
let selectedFiles = []

function updatePagesCount() {
    const cols = parseInt(colsInput.value, 10) || 1
    const rows = parseInt(rowsInput.value, 10) || 1
    const imagesPerPage = cols * rows
    const totalImages = selectedFiles.length
    
    let pages = 0
    if (totalImages > 0 && imagesPerPage > 0) {
        pages = Math.ceil(totalImages / imagesPerPage)
    }
    pagesCountSpan.textContent = `${pages} pages`
}

fileInput.addEventListener('change', function(e) {
    selectedFiles = Array.from(e.target.files)
    updatePagesCount()
})

colsInput.addEventListener('input', updatePagesCount)
rowsInput.addEventListener('input', updatePagesCount)
updatePagesCount()

// -------------------------------------- print

function printImages() {
    if (selectedFiles.length === 0) {
        alert('First, select the images')
        return
    }

    const cols = parseInt(colsInput.value, 10)
    const rows = parseInt(rowsInput.value, 10)
    if (isNaN(cols) || cols < 1) {
        alert('The number of columns must be at least 1')
        return
    }
    if (isNaN(rows) || rows < 1) {
        alert('The number of rows must be at least 1')
        return
    }

    const keepAspect = keepAspectCheck.checked
    const imagesPerPage = cols * rows
    const totalPages = Math.ceil(selectedFiles.length / imagesPerPage)

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
        alert('Allow pop-up windows for this site, it is necessary to bring up the print window')
        return
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    background: white;
                    margin: 0;
                    padding: 0;
                }

                .page {
                    page-break-after: always;
                    break-after: page;
                    width: 100%;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    align-items: flex-start;
                }
                
                .page:last-child {
                    page-break-after: auto;
                    break-after: auto;
                }

                .grid {
                    display: flex;
                    width: 100%;
                    height: 100%;
                }

                .cell {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }
                
                .cell > img {
                    position: absalute;
                    display: block;
                    max-width: 100%;
                    max-height: 100%;
                    ${keepAspect ? 'object-fit: contain;' : 'object-fit: fill;'}
                }

                @page {
                    margin: 0;
                    size: auto;
                }
                    
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    .page {
                        margin: 0;
                        padding: 0;
                        page-break-after: always;
                    }
                    .page:last-child {
                        page-break-after: auto;
                    }
                    .cell {
                        background: none;
                    }
                    @page {
                        margin: 0;
                    }
                }
            </style>
        </head>
        <body>
    `)

    // Массив для временных URL (чтобы освободить после печати)
    const tempUrls = []

    // Генерация страниц
    for (let page = 0; page < totalPages; page++) {
        const startIdx = page * imagesPerPage;
        const endIdx = Math.min(startIdx + imagesPerPage, selectedFiles.length)

        printWindow.document.write(`<div class="page"><div class="grid">`)

        for (let i = startIdx; i < endIdx; i++) {
            const file = selectedFiles[i]
            const url = URL.createObjectURL(file)
            tempUrls.push(url)
            printWindow.document.write(`
                <div class="cell">
                    <img src="${url}">
                </div>
            `)
        }

        // Заполняем оставшиеся ячейки пустыми, чтобы сетка сохраняла структуру
        const cellsOnPage = endIdx - startIdx;
        for (let j = cellsOnPage; j < imagesPerPage; j++) {
            printWindow.document.write(`<div class="cell"></div>`)
        }

        printWindow.document.write(`</div></div>`)
    }

    printWindow.document.write(`</body></html>`)
    printWindow.document.close()

    setTimeout(() => {
        printWindow.print()
    }, 500)
}

printBtn.addEventListener('click', printImages)
