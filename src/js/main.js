const inputFile = document.getElementById('input-file');
const inputColor = document.getElementById('input-color');
const select = document.getElementById('select');
const fontSizeInput = document.getElementById('font-size');
const inputTop = document.getElementById('textTop');
const inputBottom = document.getElementById('textBottom');
const buttonDownload = document.getElementById('button-download');
const canvas = document.getElementById('canvas');
const canvasBox = document.getElementById('canvas-box');

const canvasContext = canvas.getContext('2d');
let memeImage, topText = '', bottomText = '', textSize = 40, textColor = '#00000', textFontFamily = 'Arial, Helvetica, sans-serif';
let topTextElement, bottomTextElement, isDraggable = false, isTopText = false;

inputTop.addEventListener('input', updateText.bind(null, 'top'));
inputBottom.addEventListener('input', updateText.bind(null, 'bottom'));
fontSizeInput.addEventListener('input', updateTextSize);
inputColor.addEventListener('input', updateTextColor);
select.addEventListener('change', updateFontFamily);
buttonDownload.addEventListener('click', downloadMeme);
inputFile.addEventListener('change', handleImageUpload);

function updateText(position, event) {
  if (position === 'top') {
    topText = event.target.value;
    updateTextElement(topTextElement, topText);
  } else {
    bottomText = event.target.value;
    updateTextElement(bottomTextElement, bottomText);
  }
}

function updateTextSize(event) {
  textSize = Number(event.target.value);
  updateTextElementStyle(topTextElement);
  updateTextElementStyle(bottomTextElement);
}

function updateTextColor(event) {
  textColor = event.target.value;
  updateTextElementStyle(topTextElement);
  updateTextElementStyle(bottomTextElement);
}

function updateFontFamily(event) {
  textFontFamily = event.target.value;
  updateTextElementStyle(topTextElement);
  updateTextElementStyle(bottomTextElement);
}

function handleImageUpload(event) {
  if (event.target.files) {
    const imageFile = event.target.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(imageFile);

    reader.addEventListener('loadend', event => {
      memeImage = new Image();
      memeImage.src = event.target.result;
      drawMemeImage();
    });
  }
}

function drawMemeImage() {
  if (!memeImage) return;
  canvasBox.innerHTML = '';
  canvasBox.appendChild(memeImage);

  topTextElement = createTextElement(topText);
  bottomTextElement = createTextElement(bottomText);

  initTextElementEvents(topTextElement, true);
  initTextElementEvents(bottomTextElement, false);
}

function createTextElement(text) {
  const textElement = document.createElement('span');
  textElement.classList.add('draggable-element');
  updateTextElementStyle(textElement);
  textElement.textContent = text;
  canvasBox.prepend(textElement);
  return textElement;
}

function initTextElementEvents(textElement, isTop) {
  textElement.addEventListener('mousedown', event => {
    isTopText = isTop;
    startDragging(event, textElement);
  });

  textElement.addEventListener('touchstart', event => {
    startDragging(event, textElement);
  });

  document.addEventListener('mousemove', event => dragToNewPosition(event, isTopText ? topTextElement : bottomTextElement));
  document.addEventListener('touchmove', event => {
    event.preventDefault();
    dragToNewPosition(event, isTopText ? topTextElement : bottomTextElement);
  });

  document.addEventListener('mouseup', () => isDraggable = false);
  textElement.addEventListener('touchend', () => isDraggable = false);
}

function updateTextElementStyle(textElement) {
  if (textElement) {
    textElement.style.fontSize = `${textSize}px`;
    textElement.style.color = textColor;
    textElement.style.fontFamily = textFontFamily;
  }
}

function updateTextElement(textElement, text) {
  if (textElement) {
    textElement.textContent = text;
  }
}

function startDragging(event, element) {
  isDraggable = true;
  element.dataset.offsetX = (event.type === 'touchstart') ? event.touches[0].clientX - element.offsetLeft : event.clientX - element.offsetLeft;
  element.dataset.offsetY = (event.type === 'touchstart') ? event.touches[0].clientY - element.offsetTop : event.clientY - element.offsetTop;
}

function dragToNewPosition(event, element) {
  if (isDraggable) {
    const offsetX = (event.type === 'touchmove') ? event.touches[0].clientX - element.dataset.offsetX : event.clientX - element.dataset.offsetX;
    const offsetY = (event.type === 'touchmove') ? event.touches[0].clientY - element.dataset.offsetY : event.clientY - element.dataset.offsetY;

    element.style.left = `${offsetX}px`;
    element.style.top = `${offsetY}px`;
  }
}

function updateCanvas() {
  canvas.width = memeImage.naturalWidth;
  canvas.height = memeImage.naturalHeight;

  canvasContext.drawImage(memeImage, 0, 0);

  canvasContext.font = `${textSize * canvas.height / memeImage.height}px ${textFontFamily}`;
  canvasContext.fillStyle = textColor;

  canvasContext.fillText(topText,
    topTextElement.offsetLeft / memeImage.width * canvas.width,
    (topTextElement.offsetTop + textSize) / memeImage.height * canvas.height);

  canvasContext.fillText(bottomText,
    bottomTextElement.offsetLeft / memeImage.width * canvas.width,
    (bottomTextElement.offsetTop + textSize) / memeImage.height * canvas.height);
}

function downloadMeme() {
  if (memeImage) {
    updateCanvas();
    const downloadLink = document.createElement('a');
    downloadLink.href = canvas.toDataURL();
    downloadLink.download = 'bestmemever.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
}
