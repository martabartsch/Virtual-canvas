const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let lastX;
let lastY;
let snapshot;
let selectedTool = 'Pen'; // Początkowo ustawione na 'Pen'
colorInput = document.getElementById('color');
console.log(colorInput);

// Początkowa grubość linii
let lineWidth = 10;

window.addEventListener("load", () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = lineWidth; // Ustawienie początkowej grubości linii

    // Obsługa zmiany narzędzia
    const toolOptions = document.querySelectorAll('.tools-board .options .option');
    toolOptions.forEach(option => {
        option.addEventListener('click', () => {
            selectedTool = option.dataset.tool; // Ustawienie aktualnego narzędzia

            // Dezaktywuj rysowanie po zmianie narzędzia
            isDrawing = false;

            // Aktywuj rysowanie w zależności od wybranego narzędzia
            if (selectedTool === 'Pen' || selectedTool === 'Erase' || selectedTool === 'Circle'|| selectedTool === 'Point'|| selectedTool === 'Rectangle') {
                canvas.addEventListener("mousedown", startDrawing);
                canvas.addEventListener("mousemove", draw);
                canvas.addEventListener("mouseup", stopDrawing);
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
    [lastX, lastY] = [e.offsetX, e.offsetY];
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = colorInput.value;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
};

const drawCircle = (e) => {
    ctx.beginPath()
    ctx.moveTo(lastX, lastY + (e.offsetY - lastY) / 2);
    ctx.bezierCurveTo(lastX, lastY, e.offsetX, lastY, e.offsetX, lastY + (e.offsetY - lastY) / 2);
    ctx.bezierCurveTo(e.offsetX, e.offsetY, lastX, e.offsetY, lastX, lastY + (e.offsetY - lastY) / 2);
    ctx.stroke();
};

const drawPoint = (e) => {
    ctx.beginPath();
    let radius = Math.sqrt(Math.pow((lastX - e.offsetX), 2)+ Math.pow((lastY - e.offsetY), 2));
    ctx.arc(lastX, lastY, radius, 0, 2*Math.PI);
    ctx.fill();
    ctx.stroke();
};

const drawRectangle = (e) => {
    ctx.beginPath();
    ctx.strokeRect(lastX, lastY, e.offsetX- lastX, e.offsetY- lastY);
};

const draw = (e) => {
    if (!isDrawing) return;
    ctx.putImageData(snapshot, 0, 0);

    if (selectedTool === 'Pen') {
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        [lastX, lastY] = [e.offsetX, e.offsetY];
    } else if (selectedTool === 'Erase') {
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.globalCompositeOperation = 'destination-out'; // Ustawienie gumki
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over'; // Przywrócenie normalnego trybu mieszania
        [lastX, lastY] = [e.offsetX, e.offsetY];
    } else if (selectedTool === 'Point') {
        drawPoint(e);
    } else if (selectedTool === 'Circle') {
        drawCircle(e);
    } else if (selectedTool === 'Rectangle') {
        drawRectangle(e);
    }

};

const stopDrawing = () => {
    isDrawing = false;
};
