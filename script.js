// Canvas and drawing context
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// Tools and controls
const toolBtns = document.querySelectorAll(".tool");
const fillColor = document.querySelector("#fill-color");
const sizeSlider = document.querySelector("#size-slider");
const colorBtns = document.querySelectorAll(".colors .option");
const colorPicker = document.querySelector("#color-picker");
const clearCanvasBtn = document.querySelector(".clear-canvas");
const saveImgBtn = document.querySelector(".save-img");

// Pagination controls
const addPageBtn = document.getElementById("addPage");
const deletePageBtn = document.getElementById("deletePage");
const paginationContainer = document.querySelector(".drawing-pages");

// Gradient controls
const gradientStart = document.querySelector("#gradient-start");
const gradientEnd = document.querySelector("#gradient-end");
let gradientColors = [gradientStart.value, gradientEnd.value];

// Canvas pages management
const maxPages = 5;
let currentPage = 0;
let pages = [];

// Function to redraw all pagination thumbnails
const redrawPages = () => {
    paginationContainer.innerHTML = '';
    pages.forEach((pageData, index) => {
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = canvas.height;
        pageCanvas.getContext('2d').putImageData(pageData, 0, 0);

        const pageThumbnail = document.createElement('div');
        pageThumbnail.classList.add('page-thumbnail');
        pageThumbnail.textContent = `Page ${index + 1}`;
        pageThumbnail.addEventListener('click', () => goToPage(index));
        paginationContainer.appendChild(pageThumbnail);
    });
};

// Initialization on window load
window.addEventListener("load", () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setCanvasBackground();
});

// Function to add a new page
const addPage = () => {
    if (pages.length < maxPages) {
        pages.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        redrawPages();
        
    } else {
        alert("Maximum pages reached!");
    }
};

// Function to delete the current page
const deletePage = () => {
    if (pages.length > 0) {
        pages.splice(currentPage, 1);
        currentPage = Math.max(0, currentPage - 1);
        redrawPages();
        drawCurrentPage();
    }
};

// Function to navigate to a specific page
const goToPage = (pageIndex) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
        currentPage = pageIndex;
        drawCurrentPage();
    }
};

// Function to draw the current page on the canvas
const drawCurrentPage = () => {
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(pages[currentPage], 0, 0);
};

// Event listeners for pagination buttons
addPageBtn.addEventListener('click', addPage);
deletePageBtn.addEventListener('click', deletePage);

// Gradient controls event listeners
gradientStart.addEventListener("change", () => {
    gradientColors[0] = gradientStart.value;
    setCanvasBackground();
});

gradientEnd.addEventListener("change", () => {
    gradientColors[1] = gradientEnd.value;
    setCanvasBackground();
});

// Set canvas background gradient
const setCanvasBackground = () => {
    gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, gradientColors[0]);
    gradient.addColorStop(1, gradientColors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor;
};

// Drawing variables and functions
let prevMouseX, prevMouseY, snapshot, isDrawing = false, selectedTool = "brush", brushWidth = 5, selectedColor = "#000";

// Drawing functions
const drawRect = (e) => {
    if (!fillColor.checked) {
        ctx.strokeRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
    } else {
        ctx.fillRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
    }
};

const drawCircle = (e) => {
    ctx.beginPath();
    let radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX), 2) + Math.pow((prevMouseY - e.offsetY), 2));
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
    fillColor.checked ? ctx.fill() : ctx.stroke();
};

const drawTriangle = (e) => {
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
    ctx.closePath();
    fillColor.checked ? ctx.fill() : ctx.stroke();
};

const startDraw = (e) => {
    isDrawing = true;
    prevMouseX = e.offsetX;
    prevMouseY = e.offsetY;
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
};

const drawing = (e) => {
    if (!isDrawing) return;
    ctx.putImageData(snapshot, 0, 0);

    switch (selectedTool) {
        case "brush":
        case "eraser":
            ctx.strokeStyle = selectedTool === "eraser" ? gradient : selectedColor;
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
            break;
        case "rectangle":
            drawRect(e);
            break;
        case "circle":
            drawCircle(e);
            break;
        case "triangle":
            drawTriangle(e);
            break;
        default:
            break;
    }
};

// Event listeners for tools and color selectors
toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
    });
});

sizeSlider.addEventListener("change", () => {
    brushWidth = sizeSlider.value;
});

colorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .selected").classList.remove("selected");
        btn.classList.add("selected");
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    });
});

colorPicker.addEventListener("change", () => {
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
});

// Event listener for clearing canvas

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
    pages[currentPage] = ctx.getImageData(0, 0, canvas.width, canvas.height);
    redrawPages();
}


clearCanvasBtn.addEventListener("click", clearCanvas);

// Event listener for saving canvas as image
saveImgBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `${Date.now()}.jpg`;
    link.href = canvas.toDataURL();
    link.click();
});

// Event listeners for drawing actions
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", () => isDrawing = false);
