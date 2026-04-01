// Получаем элементы
const fileInput = document.getElementById('fileInput');
const colsInput = document.getElementById('cols');
const rowsInput = document.getElementById('rows');
const keepAspectCheck = document.getElementById('keepAspect');
const printBtn = document.getElementById('printBtn');
const pagesCountSpan = document.getElementById('pagesCount');

// Хранилище выбранных файлов
let selectedFiles = [];

// Функция обновления количества страниц
function updatePagesCount() {
    const cols = parseInt(colsInput.value, 10) || 1;
    const rows = parseInt(rowsInput.value, 10) || 1;
    const imagesPerPage = cols * rows;
    const totalImages = selectedFiles.length;
    
    let pages = 0;
    if (totalImages > 0 && imagesPerPage > 0) {
        pages = Math.ceil(totalImages / imagesPerPage);
    }
    pagesCountSpan.textContent = `${pages} pages`;
}

// Событие при выборе файлов
fileInput.addEventListener('change', function(e) {
    selectedFiles = Array.from(e.target.files);
    updatePagesCount();
});

// События изменения количества столбцов/строк
colsInput.addEventListener('input', updatePagesCount);
rowsInput.addEventListener('input', updatePagesCount);

// Дополнительно: если меняется чекбокс, количество страниц не меняется, но можно вызвать для единообразия
keepAspectCheck.addEventListener('change', updatePagesCount); // не влияет, но пусть будет

// Функция печати (адаптирована из предыдущего решения)
function printImages() {
    if (selectedFiles.length === 0) {
        alert('Сначала выберите изображения.');
        return;
    }

    const cols = parseInt(colsInput.value, 10);
    const rows = parseInt(rowsInput.value, 10);
    if (isNaN(cols) || cols < 1) {
        alert('Количество столбцов должно быть не менее 1');
        return;
    }
    if (isNaN(rows) || rows < 1) {
        alert('Количество строк должно быть не менее 1');
        return;
    }

    const keepAspect = keepAspectCheck.checked;
    const imagesPerPage = cols * rows;
    const totalPages = Math.ceil(selectedFiles.length / imagesPerPage);

    // Открываем новое окно для печати
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Разрешите всплывающие окна для этого сайта.');
        return;
    }

    // Начинаем формировать HTML
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Печать изображений</title>
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
                    justify-content: center;
                    align-items: center;
                    background: white;
                }
                .page:last-child {
                    page-break-after: auto;
                    break-after: auto;
                }
                .grid {
                    display: grid;
                    grid-template-columns: repeat(${cols}, 1fr);
                    grid-auto-rows: 1fr;
                    gap: 4px;
                    width: 100%;
                    height: 100%;
                    background: #fff;
                }
                .cell {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #fafafa;
                    overflow: hidden;
                }
                img {
                    display: block;
                    max-width: 100%;
                    max-height: 100%;
                    ${keepAspect ? 'object-fit: contain;' : 'object-fit: fill;'}
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
                    .grid {
                        gap: 2px;
                    }
                    .cell {
                        background: none;
                    }
                }
            </style>
        </head>
        <body>
    `);

    // Массив для временных URL (чтобы освободить после печати)
    const tempUrls = [];

    // Генерация страниц
    for (let page = 0; page < totalPages; page++) {
        const startIdx = page * imagesPerPage;
        const endIdx = Math.min(startIdx + imagesPerPage, selectedFiles.length);

        printWindow.document.write(`<div class="page"><div class="grid">`);

        for (let i = startIdx; i < endIdx; i++) {
            const file = selectedFiles[i];
            const url = URL.createObjectURL(file);
            tempUrls.push(url);
            printWindow.document.write(`
                <div class="cell">
                    <img src="${url}" alt="${escapeHtml(file.name)}">
                </div>
            `);
        }

        // Заполняем оставшиеся ячейки пустыми, чтобы сетка сохраняла структуру
        const cellsOnPage = endIdx - startIdx;
        for (let j = cellsOnPage; j < imagesPerPage; j++) {
            printWindow.document.write(`<div class="cell"></div>`);
        }

        printWindow.document.write(`</div></div>`);
    }

    printWindow.document.write(`</body></html>`);
    printWindow.document.close();

    // Даём время на загрузку изображений (хотя бы 500мс) и вызываем печать
    setTimeout(() => {
        printWindow.print();
        // После печати освобождаем ресурсы и закрываем окно
        setTimeout(() => {
            tempUrls.forEach(url => URL.revokeObjectURL(url));
            printWindow.close();
        }, 1000);
    }, 500);
}

// Простое экранирование для имени файла
function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Назначаем обработчик на кнопку печати
printBtn.addEventListener('click', printImages);

// Инициализация (показываем 0 страниц)
updatePagesCount();
