const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let startX;
let startY;
let snapshot;
let selectedTool = 'Pen';
let fillColorCheckbox;
let isLoggedFirst = true;
const showColumnButton = document.getElementById('show-column-button');
const canvasListSection = document.querySelector('.side-column');
colorInput = document.getElementById('color');
saveButton = document.querySelector('.save-button');
saveDraftButton = document.querySelector('.save-draft-button');
clearButton = document.querySelector('.clear-button');
let lineWidth = 8;
const canvasListContainer = document.getElementById('canvas-list-container');

    // Funkcja do ładowania danych canvasa z serwera
    const loadDataFromServer = () => {
        fetch('/load-canvas-data')
            .then(response => response.json())
            .then(data => {
                if (data.canvasData) {
                    // Wczytaj dane do LocalStorage i wyświetl listę płócienek
                    data.canvasData.forEach((canvasData, index) => {
                        const canvasKey = `canvasData_${new Date().getTime()}_${index}`;
                        localStorage.setItem(canvasKey, canvasData);
                        displayCanvasList();
                    });
                }
            })
            .catch(error => {
                console.error(error);
                alert('Error loading canvas data from the server.');
            });
    };

    const displayCanvasList = () => {
        // Pobierz wszystkie zapisane płótna z LocalStorage
        const savedCanvases = Object.keys(localStorage).filter(key => key.startsWith('canvasData_'));
        // Wyświetl listę płócienek
        canvasListContainer.innerHTML = '';
        savedCanvases.forEach((canvasKey, index) => {
        const canvasItem = document.createElement('li');
        const canvasName = localStorage.getItem(`canvasName_${canvasKey}`);
        canvasItem.textContent = `${canvasName || 'Unknown'}`;

        // Dodaj przycisk usuwania
        const deleteButton = document.createElement('span');
        deleteButton.className = 'delete-icon';
        deleteButton.textContent = 'X';
        deleteButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Zatrzymaj propagację, aby nie wywołać zdarzenia na całej liście
            deleteCanvas(canvasKey);
            displayCanvasList(); // Aktualizuj listę płócienek po usunięciu
        });

        canvasItem.appendChild(deleteButton);

        // Dodaj zdarzenie kliknięcia na całą pozycję na liście
        canvasItem.addEventListener('click', () => loadCanvasFromLocalStorage(canvasKey));
        canvasListContainer.appendChild(canvasItem);
    });
    };


    // Funkcja do ładowania zapisanego canvasa z LocalStorage
    const loadCanvasFromLocalStorage = (canvasKey) => {
        const savedCanvasData = localStorage.getItem(canvasKey);
        if (savedCanvasData) {
            const img = new Image();
            img.onload = function () {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
            img.src = savedCanvasData;
        }
    };

    // Funkcja do usuwania danych canvasa z LocalStorage i z listy
    const deleteCanvas = (canvasKey) => {
        const confirmDelete = confirm('Are you sure you want to delete this canvas?');

        if (confirmDelete) {
            localStorage.removeItem(canvasKey);
            localStorage.removeItem(`canvasName_${canvasKey}`);
            displayCanvasList(); // Aktualizuj listę płócienek po usunięciu
        }
    };

    // Funkcja do zapisywania danych canvasa w LocalStorage
    const saveCanvasDataSaveOnDraft = () => {
        const currentCanvasData = canvas.toDataURL();
        const canvasKey = `canvasData_${new Date().getTime()}`;

        let canvasName = prompt('Enter canvas name:');

        // Sprawdź, czy użytkownik anulował wprowadzenie
        if (canvasName === null) {
            canvasName = 'Unknown'; // Ustaw domyślną nazwę
        }

        localStorage.setItem(canvasKey, currentCanvasData);
        localStorage.setItem(`canvasName_${canvasKey}`, canvasName);
        displayCanvasList(); // Aktualizuj listę płócienek po zapisie
    };

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
    showColumnButton.addEventListener('click', () => {
        canvasListSection.classList.toggle('show');
        displayCanvasList();
    });
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
         if(isLoggedFirst){
             loadDataFromServer();
             isLoggedFirst = false;
         }
         console.log(isLoggedFirst);
        restoreCanvasDataFromLocal();
        // Funkcja do zapisywania obrazu
        const saveCanvas = () => {
            const image = canvas.toDataURL(); // Konwertuj canvas na URL obrazu
            const a = document.createElement('a');
            a.href = image;
            a.download = 'canvas_image.png'; // Nazwa pliku do pobrania
            a.click();
        };

        const clearCanvas = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            saveCanvasDataToLocal();
        };

        // Funkcja do czyszczenia całego obszaru rysunku
        const saveDraftCanvas = () => {
            saveCanvasDataSaveOnDraft();
        };

        saveButton.addEventListener('click', saveCanvas);
        saveDraftButton.addEventListener('click', saveDraftCanvas);
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

    // Przykład funkcji do wysłania danych na serwer przy wylogowywaniu
    const saveDataToServer = () => {
        const canvasData = localStorage.getItem('canvasData');

        // Sprawdź, czy canvasData nie jest null
        if (canvasData !== null) {
            fetch('/save-canvas-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ canvasData }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error saving canvas data on the server.');
                }
                // Jeśli zapisanie danych na serwerze powiedzie się, usuń dane z localStorage
                localStorage.removeItem('canvasData');
            })
            .catch(error => {
                console.error(error);
                alert('Error saving canvas data on the server.');
            });
        } else {
            // Jeżeli canvasData jest null, możesz podjąć odpowiednie działania lub po prostu zignorować wysyłanie danych
            console.log('canvasData is null. No data will be sent to the server.');
        }
    };

    document.getElementById("logout-button").addEventListener("click", function() {
            saveDataToServer();
            window.location.href = "/logout";
        });
