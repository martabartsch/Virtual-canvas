const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let startX;
let startY;
let snapshot;
let selectedTool = 'Pen';
let fillColorCheckbox;
colorInput = document.getElementById('color');
saveButton = document.querySelector('.save-button');
clearButton = document.querySelector('.clear-button');
let lineWidth = 8;

    // Funkcja do zapisywania danych canvasa w LocalStorage
    const saveCanvasDataToLocal = () => {
        const currentCanvasData = canvas.toDataURL();
        localStorage.setItem('canvasData', currentCanvasData);
    };

    // Funkcja do przywracania danych canvasa z LocalStorage
    const restoreCanvasDataFromLocal = () => {
        const savedCanvasData = localStorage.getItem('canvasData');
        if (savedCanvasData) {
            const img = new Image();
            img.onload = function () {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
            img.src = savedCanvasData;
        }
    };
    window.addEventListener("load", () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.lineWidth = lineWidth; // Ustawienie początkowej grubości linii
        fillColorCheckbox = document.getElementById("fill-color");
        fillColorCheckbox.addEventListener("change", () => {
            if (fillColorCheckbox.checked) {
                ctx.fillStyle = colorInput.value;
            } else {
                ctx.fillStyle = 'transparent';
            }
        });

        restoreCanvasDataFromLocal();
        // Funkcja do zapisywania obrazu
        const saveCanvas = () => {
            const image = canvas.toDataURL(); // Konwertuj canvas na URL obrazu
            const a = document.createElement('a');
            a.href = image;
            a.download = 'canvas_image.png'; // Nazwa pliku do pobrania
            a.click();
        };

        // Funkcja do czyszczenia całego obszaru rysunku
        const clearCanvas = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        };

        saveButton.addEventListener('click', saveCanvas);
        clearButton.addEventListener('click', clearCanvas);

        // Obsługa zmiany narzędzia
        const toolOptions = document.querySelectorAll('.tools-board .options .option');
        toolOptions.forEach(option => {
            option.addEventListener('click', () => {
                selectedTool = option.dataset.tool; // Ustawienie aktualnego narzędzia

                // Dezaktywuj rysowanie po zmianie narzędzia
                isDrawing = false;

                // Aktywuj rysowanie w zależności od wybranego narzędzia
                if (selectedTool === 'Pen' || selectedTool === 'Erase' || selectedTool === 'Circle'|| selectedTool === 'Point'|| selectedTool === 'Rectangle' || selectedTool === 'Line' || selectedTool === 'Arrow') {
                    canvas.addEventListener("mousedown", startDrawing);
                    canvas.addEventListener("mousemove", draw);
                    saveCanvasDataToLocal();
                    canvas.addEventListener("mouseup", stopDrawing);
                    saveCanvasDataToLocal();
                } else {
                    // W przeciwnym razie dezaktywuj rysowanie
                    canvas.removeEventListener("mousedown", startDrawing);
                    canvas.removeEventListener("mousemove", draw);
                    canvas.removeEventListener("mouseup", stopDrawing);
                }
            });
        });

        // Obsługa zmiany grubości linii za pomocą suwaka
        const lineWidthSlider = document.getElementById("line-width-slider");
        lineWidthSlider.addEventListener("input", () => {
            lineWidth = parseInt(lineWidthSlider.value);
            ctx.lineWidth = lineWidth; // Ustawienie aktualnej grubości linii
        });

    });

    const startDrawing = (e) => {
        isDrawing = true;
        [startX, startY] = [e.offsetX, e.offsetY];
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = colorInput.value;
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    };
    const drawCircle = (e) => {
        ctx.beginPath()
        ctx.moveTo(startX, startY + (e.offsetY - startY) / 2);
        ctx.bezierCurveTo(startX, startY, e.offsetX, startY, e.offsetX, startY + (e.offsetY - startY) / 2);
        ctx.bezierCurveTo(e.offsetX, e.offsetY, startX, e.offsetY, startX, startY + (e.offsetY - startY) / 2);
        ctx.fillStyle = fillColorCheckbox.checked ? colorInput.value : 'transparent';
        ctx.stroke();
        ctx.fill();
    };

    const drawPoint = (e) => {
        ctx.beginPath();
        let radius = Math.sqrt(Math.pow((startX - e.offsetX), 2)+ Math.pow((startY - e.offsetY), 2));
        ctx.arc(startX, startY, radius, 0, 2*Math.PI);
        ctx.fillStyle = fillColorCheckbox.checked ? colorInput.value : 'transparent';
        ctx.stroke();
        ctx.fill();
    };

    const drawRectangle = (e) => {
        ctx.beginPath();
        ctx.strokeRect(startX, startY, e.offsetX- startX, e.offsetY- startY);
        ctx.fillStyle = fillColorCheckbox.checked ? colorInput.value : 'transparent';
        ctx.stroke();
        ctx.fillRect(startX, startY, e.offsetX- startX, e.offsetY- startY);
    };

    const drawArrow = (e) => {
        // Draw line
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();

        // Draw arrow
        const angle = Math.atan2(e.offsetY - startY, e.offsetX - startX);
        ctx.beginPath();
        ctx.moveTo(e.offsetX - lineWidth * Math.cos(angle - Math.PI / 4), e.offsetY - lineWidth * Math.sin(angle - Math.PI / 4));
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.lineTo(e.offsetX- lineWidth * Math.cos(angle + Math.PI / 4), e.offsetY - lineWidth * Math.sin(angle + Math.PI / 4));
        ctx.closePath();
        ctx.stroke();
    };

    const drawLine = (e) => {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    };

    const draw = (e) => {
        if (!isDrawing) return;
        ctx.putImageData(snapshot, 0, 0);

        if (selectedTool === 'Pen') {
            ctx.moveTo(startX, startY);
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
            [startX, startY] = [e.offsetX, e.offsetY];
        } else if (selectedTool === 'Erase') {
            ctx.moveTo(startX, startY);
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.globalCompositeOperation = 'destination-out'; // Ustawienie gumki
            ctx.stroke();
            ctx.globalCompositeOperation = 'source-over'; // Przywrócenie normalnego trybu mieszania
            [startX, startY] = [e.offsetX, e.offsetY];
        } else if (selectedTool === 'Point') {
            drawPoint(e);
        } else if (selectedTool === 'Circle') {
            drawCircle(e);
        } else if (selectedTool === 'Rectangle') {
            drawRectangle(e);
        } else if (selectedTool === 'Line') {
            drawLine(e);
        } else if(selectedTool === 'Arrow') {
            drawArrow(e);
        }

    };

    const stopDrawing = () => {
        isDrawing = false;
        saveCanvasDataToLocal();
    };

    document.getElementById("logout-button").addEventListener("click", function() {
            window.location.href = "/logout";
        });
