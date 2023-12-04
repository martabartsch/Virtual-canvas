const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let startX;
let startY;
let snapshot;
let selectedTool = 'Pen';
let fillColorCheckbox;
const showColumnButton = document.getElementById('show-column-button');
const canvasListSection = document.querySelector('.side-column');
colorInput = document.getElementById('color');
saveButton = document.querySelector('.save-button');
saveDraftButton = document.querySelector('.save-draft-button');
clearButton = document.querySelector('.clear-button');
let lineWidth = 8;
const canvasListContainer = document.getElementById('canvas-list-container');

// Load from server
const loadDataFromServer = () => {
    // Check that data is load
    if (localStorage.getItem('dataLoaded')) {
        return;
    }
    fetch('/load-canvas-data')
        .then(response => response.json())
        .then(data => {
            if (data.canvasDataList) {
                // Load canvas and dispaly on canvas list
                data.canvasDataList.forEach((canvasDataObj, index) => {
                    const canvasKey = `canvasData_${new Date().getTime()}_${index}`;
                    localStorage.setItem(canvasKey, canvasDataObj.canvasData);
                    localStorage.setItem(`canvasName_${canvasKey}`, canvasDataObj.canvasName);
                    displayCanvasList();
                });
                // Set flag that data is load
                localStorage.setItem('dataLoaded', 'true');
            }
        })
        .catch(error => {
            console.error(error);
            alert('Error loading canvas data from the server');
        });
};

const displayCanvasList = () => {
    // Download all canvas from LocalStorage
    const savedCanvases = Object.keys(localStorage).filter(key => key.startsWith('canvasData_'));
    // All list display
    canvasListContainer.innerHTML = '';
    savedCanvases.forEach((canvasKey, index) => {
    const canvasItem = document.createElement('li');
    const canvasName = localStorage.getItem(`canvasName_${canvasKey}`);
    canvasItem.textContent = `${canvasName || 'Unknown'}`;

    // Delete BUTTON create
    const deleteButton = document.createElement('span');
    deleteButton.className = 'delete-icon';
    deleteButton.textContent = 'X';
    deleteButton.addEventListener('click', (event) => {
        event.stopPropagation(); // NOT FOR ALL LIST
        deleteCanvas(canvasKey);
        displayCanvasList(); //Update list
    });

    canvasItem.appendChild(deleteButton);

    canvasItem.addEventListener('click', () => loadCanvasFromLocalStorage(canvasKey));
    canvasListContainer.appendChild(canvasItem);
});
};


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

// Delete data from localStorage & DRAFT list
const deleteCanvas = (canvasKey) => {
    const confirmDelete = confirm('Are you sure you want to delete this canvas?');

    if (confirmDelete) {
        localStorage.removeItem(canvasKey);
        localStorage.removeItem(`canvasName_${canvasKey}`);
        displayCanvasList(); // Update List
    }
};

// Save DRAFT data to LocalStorage !
const saveCanvasDataSaveOnDraft = () => {
    const currentCanvasData = canvas.toDataURL();
    const canvasKey = `canvasData_${new Date().getTime()}`; // random uniq number

    let canvasName = prompt('Enter canvas name:');

    // IF user enter without name put unknown name
    if (canvasName === null) {
        canvasName = 'Unknown';
    }

    localStorage.setItem(canvasKey, currentCanvasData);
    localStorage.setItem(`canvasName_${canvasKey}`, canvasName);
    displayCanvasList(); // Update List
};

// Save data to LocalStorage
const saveCanvasDataToLocal = () => {
    const currentCanvasData = canvas.toDataURL();
    localStorage.setItem('canvasData', currentCanvasData);
};

const restoreCanvasDataFromLocal = () => {
    const savedCanvasData = localStorage.getItem('canvasData');
    if (savedCanvasData) {
        const img = new Image()  // Convert canvas to URL
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
    ctx.lineJoin = "round"; // Round line for estetic view
    ctx.lineCap = "round"; // Round line for estatic view
    ctx.lineWidth = lineWidth;
    fillColorCheckbox = document.getElementById("fill-color");
    fillColorCheckbox.addEventListener("change", () => {
        if (fillColorCheckbox.checked) {
            ctx.fillStyle = colorInput.value;
        } else {
            ctx.fillStyle = 'transparent';
        }
    });
    loadDataFromServer();
    restoreCanvasDataFromLocal();


    const saveCanvas = () => {
        const image = canvas.toDataURL(); // Convert canvas to URL
        const a = document.createElement('a');
        a.href = image;
        a.download = 'canvas_image.png'; // TO DO CHANGE IT FROM PROMPT USER NAME
        a.click();
    };

    // Clear all canvas
    const clearCanvas = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        saveCanvasDataToLocal();
    };

    const saveDraftCanvas = () => {
        saveCanvasDataSaveOnDraft();
    };

    saveButton.addEventListener('click', saveCanvas);
    saveDraftButton.addEventListener('click', saveDraftCanvas);
    clearButton.addEventListener('click', clearCanvas);

    // Change Tool
    const toolOptions = document.querySelectorAll('.tools-board .options .option');
    toolOptions.forEach(option => {
        option.addEventListener('click', () => {
            selectedTool = option.dataset.tool; // Set current tool

            // Deactivate drawing before change selected Tool
            isDrawing = false;

            // Active selecetd tool
            if (selectedTool === 'Pen' || selectedTool === 'Erase' || selectedTool === 'Circle'|| selectedTool === 'Dot'|| selectedTool === 'Rectangle' || selectedTool === 'Line' || selectedTool === 'Arrow') {
                canvas.addEventListener("mousedown", startDrawing);
                canvas.addEventListener("mousemove", draw);
                saveCanvasDataToLocal();
                canvas.addEventListener("mouseup", stopDrawing);
                saveCanvasDataToLocal();
            } else {
                // Deactive drawing
                canvas.removeEventListener("mousedown", startDrawing);
                canvas.removeEventListener("mousemove", draw);
                canvas.removeEventListener("mouseup", stopDrawing);
            }
        });
    });

    // Slider Line Width
    const lineWidthSlider = document.getElementById("line-width-slider");
    lineWidthSlider.addEventListener("input", () => {
        lineWidth = parseInt(lineWidthSlider.value);
        ctx.lineWidth = lineWidth; // Set current line of selectedTool
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
    ctx.fillStyle = fillColorCheckbox.checked ? colorInput.value : 'transparent'; // Transparent it is nothing
    ctx.stroke();
    ctx.fill();
};

const drawPoint = (e) => {
    ctx.beginPath();
    let radius = Math.sqrt(Math.pow((startX - e.offsetX), 2)+ Math.pow((startY - e.offsetY), 2));
    ctx.arc(startX, startY, radius, 0, 2*Math.PI);
    ctx.fillStyle = fillColorCheckbox.checked ? colorInput.value : 'transparent'; // Transparent it is nothing
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
        ctx.globalCompositeOperation = 'destination-out'; // Set rubber
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
        [startX, startY] = [e.offsetX, e.offsetY];

    } else if (selectedTool === 'Dot') {
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

// Send data to server and save it during user log out from session
const saveDataToServer = () => {
    const savedCanvases = Object.keys(localStorage).filter(key => key.startsWith('canvasData_'));

    savedCanvases.forEach(canvasKey => {
        const canvasData = localStorage.getItem(canvasKey);
        const canvasName = localStorage.getItem(`canvasName_${canvasKey}`);
        console.log(canvasName);
        console.log(canvasData);
        // Chceck that canvasData is null or CanvasName
        if (canvasData !== null && canvasName !== null) {
            fetch('/save-canvas-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ canvasData, canvasName }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error saving canvas data on the server. Some problem exist');
                }
                localStorage.removeItem(canvasKey);
                localStorage.removeItem(`canvasName_${canvasKey}`);
            })
            .catch(error => {
                console.error(error);
                alert('Error saving canvas data on the server. Some problem exist');
            });
        } else {
            console.log('No data will be sent to the server.');
        }
    });
    localStorage.clear();
};

document.getElementById("logout-button").addEventListener("click", function() {
        saveDataToServer();
        window.location.href = "/logout";
    });
