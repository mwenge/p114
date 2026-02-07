var translations = [];
var translatedSection = null;
var current = 0;

function scrollToBookmark(page) {
  var pageName = page.replace(".html", "");
  var positionOnPage = pageName + "ScrollPosition";
  var scrollPosition = localStorage.getItem(positionOnPage);
  if (scrollPosition == null) {
    updateHighlightedLines(127);
    document.getElementById("line-123").scrollIntoView();
    return;
  }
  window.scrollTo(0, scrollPosition)

  var lineOnPage = pageName + "LineNumber";
  var lineNumber = localStorage.getItem(lineOnPage);
  if (lineNumber) {
    var line = parseInt(lineNumber, 10);
    updateHighlightedLines(line);
  }
}

function loadPageToScrollPosition() {
  var book = titleElements[0] + titleElements[1];
  var path = window.location.pathname;
  var page = path.split("/").pop();

  let allLines = Array.from(document.getElementsByClassName("hexameter-line"));
  allLines.forEach( i => {
    let l = parseInt(i.id.split('-').slice(-1)[0], 10);
    i.addEventListener("mouseenter", highlightLineWhenHovered(l));
  });

  var bookmarkedPageFieldName = book + "Page";
  var pageFileName = localStorage.getItem(bookmarkedPageFieldName);

  // If there is no bookmarked page set, set this one as our bookmark
  // and scroll to the previously stored position on it.
  if (pageFileName == null) {
    localStorage.setItem(bookmarkedPageFieldName, page);
    scrollToBookmark(page);
    return;
  }

  // If this is the bookmarked page, scroll to the bookmarked position.
  if (pageFileName == page) {
    scrollToBookmark(page);
    return;
  }

  // Otherwise navigate to the bookmarked page.
  scrollToBookmark(page);
}

function storeScrollPosition(lineNumber) {
  var book = titleElements[0] + titleElements[1];
  var path = window.location.pathname;
  var page = path.split("/").pop();
  localStorage.setItem(book + "Page", page);

  var pageOfBook = page.replace(".html", "");
  var positionOnPage = pageOfBook + "ScrollPosition";
  scrollPosition = window.pageYOffset;
  localStorage.setItem(positionOnPage, scrollPosition);
  var lineOnPage = pageOfBook + "LineNumber";
  localStorage.setItem(lineOnPage, lineNumber);
}

function showNextOnHelper(evt) {
  current++;
  if (current > translations.length - 1) {
    current = 0;
  }
  var translation = translations[current];
  var innerHTML = "<span><span style='font-weight: bold; font-family:\"GFS Didot\"'>"
    + translation[0] + ",</span> " + translation[1] + "</span>";
  helper.innerHTML = innerHTML;
  if (translations.length > 1) {
    var transCount = document.createElement("span");
    transCount.id = 'transCount';
    transCount.textContent = (current + 1) + "/" + translations.length;
    helper.appendChild(transCount);
  }
}


function updateLineHighlights(newLine) {
  let allLines = Array.from(document.getElementsByClassName("hexameter-line"));
  allLines.forEach( i => {
    i.classList.remove("line-highlight");
  });

  let newUncialLine = document.getElementById("uncial-line-" + newLine);
  let newMinorLine = document.getElementById("line-" + newLine);
  let newImageLine = document.getElementById("image-line-" + newLine);
  if (newUncialLine) {
    newUncialLine.classList.add("line-highlight");
    newMinorLine.classList.add("line-highlight");
    if (newImageLine) {
      newImageLine.classList.add("line-highlight");
    }
  }
  displayPayprusLine(newLine);
}

function displayPayprusLine(lineNumber) {
  // Update the line tip display.
  let area = coordinates.get(lineNumber);
  var canvas = document.createElement('canvas');
  canvas.className = "line-canvas";
  canvas.height = 33;
  canvas.width = 33 * (area.width / area.height);
  var ctx = canvas.getContext('2d', {alpha: false});
  let imageID = imageIDs.get(currentImage);
  let img = document.getElementById(imageID);
  console.log(currentImage, img);
  if (!img) {
    return;
  }
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);

  let lineAbove = document.getElementById("uncial-line-" + (lineNumber - 1));
  let currentLine = document.getElementById("uncial-line-" + lineNumber);
  lineTipLine = currentLine.cloneNode(true);
  lineTipLine.className = "tip-line";
  lineTipLine.id = "";
  linetipimage.innerHTML = "";
  linetipimage.appendChild(canvas);
  linetipline.innerHTML = "";
  linetipline.appendChild(lineTipLine);
  linetip.style.display = "block";

  /*
  let rect = lineAbove.getBoundingClientRect();
  console.log(lineNumber, rect);
  linetip.style.top = (rect.y - 5) + "px";
  linetip.style.left = rect.x + "px";
  */
}

function updateHelper(evt, lineNumber, translationsForWord) {
  
  if (translatedLines.length && !translatedLines.includes(lineNumber)) {
    hideTranslation();
    hideComment();
  }

  if (evt.target == updateHelper.currentWord) {
    if (["none",""].includes(parallel_translation.style.display)) {
      displayTranslation(lineNumber);
    } else {
      displayComment(lineNumber);
    }
  }

  // Clear the background on currently highlighted word.
  if (typeof updateHelper.currentWord === 'object') {
    updateHelper.currentWord.style.backgroundColor = "transparent";
  }
  // Highlight the selected word.
  evt.target.style.backgroundColor = "rgba(80,80,80, 0.2)";
  updateHelper.currentWord = evt.target;
  updateHelper.currentLine = lineNumber;

  translations = translationsForWord;
  var translation = translations[0];
  if (translation) {
    var innerHTML = "<span><span style='font-weight: bold; font-family:\"GFS Didot\"'>"
      + translation[0] + ",</span> " + translation[1] + "</span>";
    helper.innerHTML = innerHTML;
    helper.style.display = "block";
  }

  if (translations.length > 1) {
    var transCount = document.createElement("span");
    transCount.id = 'transCount';
    transCount.textContent = "1/" + translations.length;
    helper.appendChild(transCount);
  }

  var line = parseInt(lineNumber, 10);
  updateHighlightedLines(line);

  storeScrollPosition(lineNumber);
}

function toggleMenu() {
  menu.style.display = (menu.style.display == 'block') ? "none" : "block";

  // Clear any current bookmark so we can navigate to the selected page.
  var book = titleElements[0] + titleElements[1];
  var bookmarkedPageFieldName = book + "Page";
  localStorage.removeItem(bookmarkedPageFieldName);
}

function showTitle(ignore) {
  var author = titleElements[0];
  var title = titleElements[1];
  var innerHTML = "<span class=\"author\" onclick=\"toggleMenu()\">" + author + "&nbsp;</span>";
  innerHTML += "<span class=\"title\" onclick=\"toggleMenu()\">" + title + "</span>";
  innerHTML += "<span class=\"book\" onclick=\"toggleMenu()\">&nbsp;&nbsp;" + book + "</span>";
  masthead.innerHTML = innerHTML;
}

// Gets overwritten by actual translations
var translation = {}
var commentary = {}

let translatedLines = [];

function displayTranslation(line) {
  if (!translation.hasOwnProperty(line)) {
    return false;
  }
  comment.style.display = "none";
  tips.style.display = "none";
  
  // Clear the translation highlights on all text.
  let allLines = Array.from(document.getElementsByClassName("hexameter-line"));
  allLines.forEach( i => {
    i.classList.remove("translation-highlight");
  });

  // Find the translation this line is part of and get
  // the line numbers for the translation.
  let ref = translation[line];
  if (!Number.isInteger(ref)) {
    ref = line;
  }
  translatedLines = Object.entries(translation)
    .filter(([k,v]) => v == ref)
    .map(([k,v]) => k);
  translatedLines.push(ref.toString());

  // Highlight the transalted text.
  translatedLines.forEach( i => {
    let line = document.getElementById("line-"+i);
    line.classList.add("translation-highlight");
    line = document.getElementById("uncial-line-"+i);
    line.classList.add("translation-highlight");
    line = document.getElementById("image-line-"+i);
    if (line) {
      line.classList.add("translation-highlight");
    }
  });

  parallel_translation.innerHTML = atobUTF8(translation[ref]);
  parallel_translation.style.display = "block";
  return true;
}
function hideTips() {
  tips.style.display = "none";
}

function hideTranslation() {
  let allLines = Array.from(document.getElementsByClassName("hexameter-line"));
  allLines.forEach( i => {
    i.classList.remove("translation-highlight");
  });
  parallel_translation.style.display = "none";
}

function displayComment(line) {
  if (!commentary[line]) {
    return false;
  }
  parallel_translation.style.display = "none";
  tips.style.display = "none";

  comment.innerHTML = atobUTF8(commentary[line]);
  comment.style.display = "block";
  return true;
}

function hideComment() {
  comment.style.display = "none";
}

function hideTip() {
  linetip.style.display = "none";
}

let imageIDs = new Map(
  [
    ["papyrus_pages/page1_rotated.jpg", "page1_image"],
    ["papyrus_pages/page2_rotated.jpg", "page2_image"],
    ["papyrus_pages/page3_rotated.jpg", "page3_image"],
    ["papyrus_pages/page4_rotated.jpg", "page4_image"],
    ["papyrus_pages/page5_rotated.jpg", "page5_image"],
    ["papyrus_pages/page6.jpg", "page6_image"],
    ["papyrus_pages/page7_rotated.jpg", "page7_image"],
    ["papyrus_pages/page8_rotated.jpg", "page8_image"],
    ["papyrus_pages/page9_rotated.jpg", "page9_image"],
    ["papyrus_pages/page10_rotated.jpg", "page10_image"],
    ["papyrus_pages/page11.jpg", "page11_image"],
    ["papyrus_pages/page12.jpg", "page12_image"],
    ["papyrus_pages/page13_rotated.jpg", "page13_image"],
    ["papyrus_pages/page14_rotated.jpg", "page14_image"],
    ["papyrus_pages/page15_rotated.jpg", "page15_image"],
    ["papyrus_pages/page16_rotated.jpg", "page16_image"],
  ]
);

let currentImage = null;
function updateHighlightedLines(line) {
  if (!images.has(line)) {
    return;
  }

  // Check if we've already loaded theimage and just
  // need to update the highlighted lines.
  let imageToAdd = images.get(line);
  if (imageToAdd == currentImage) {
    updateLineHighlights(line);
    return;
  }

  // Has the image loaded?
  let imageID = imageIDs.get(imageToAdd);
  let img = document.getElementById(imageID);
  if (!img || img.naturalWidth == 0) {
    return;
  }

  currentImage = imageToAdd;

  img.scrollIntoView({
      behavior: "smooth",
  });

  addLinesAfterImageHasLoaded(line, imageToAdd, img);
}

function highlightLineWhenHovered(l) {
  return function(e) {
    updateHighlightedLines(l);
  }
}

function updateLinesWhenClicked(l) {
  return function(e) {
    updateLineHighlights(l);
    displayTranslation(l.toString());
  }
}

function addLinesAfterImageHasLoaded(line, imageToAdd, img) {
  if (!coordinates.has(line)) {
    return;
  }
  imagecontainer.innerHTML = ""

  // Add all line boxes to the image.
  let linesInImage = linesForImage.get(imageToAdd);
  linesInImage.forEach(l => {
    var area = coordinates.get(l);
    var lineDiv = document.createElement("div");
    lineDiv.className = "hexameter-line image-line";
    lineDiv.id = "image-line-" + l;
    lineDiv.style.width = ((area.width / img.naturalWidth) * 100) + '%';
    lineDiv.style.height = ((area.height / img.naturalHeight) * 100) + '%';
    lineDiv.style.top = ((area.y / img.naturalHeight) * 100) + '%';
    lineDiv.style.left = ((area.x / img.naturalWidth) * 100) + '%';
    lineDiv.addEventListener("mouseenter", highlightLineWhenHovered(l));
    lineDiv.addEventListener("click", updateLinesWhenClicked(l));
    imagecontainer.appendChild(lineDiv);
  });
  updateLineHighlights(line);
}

window.onload = loadPageToScrollPosition;
