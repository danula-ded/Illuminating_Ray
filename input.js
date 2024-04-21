const root = document.getElementById("root");
const siteSearch = document.getElementById("site-search");
const selectTest = document.getElementById("tests-select");

siteSearch.addEventListener("input", highlight);
selectTest.addEventListener("change", highlight);

function highlight() {
  // Проверяем поддержку CSS Custom Highlight API
  if (!CSS.supports("content-visibility", "auto")) {
    root.textContent = "CSS Custom Highlight API не поддерживается.";
    return;
  }

  // Получаем значение из поисковой строки
  const searchString = siteSearch.value.toLowerCase();
  if (!searchString) {
    return;
  }

  // Находим все текстовые узлы внутри корневого элемента и его дочерних элементов
  const allTextNodes = findAllTextNodes(root);

  // Попробуем сначала найти фразу с пробелами
  let ranges = [];
  if (searchString.includes(" ")) {
    const searchStringWithoutSpaces = searchString.replace(/\s+/g, "");
    ranges = findRanges(searchStringWithoutSpaces, allTextNodes);
  }

  // Если не найдено, попробуем найти фразу без пробелов
  if (ranges.length === 0) {
    ranges = findRanges(searchString, allTextNodes);
  }

  // Если и это не помогло, ищем по словам
  if (ranges.length === 0) {
    const searchWords = searchString.split(/\s+/);
    for (const word of searchWords) {
      ranges.push(...findRanges(word, allTextNodes));
    }
  }

  // Если ничего не найдено, выходим
  if (ranges.length === 0) {
    return;
  }

  // Очищаем существующие выделения
  CSS.highlights.clear();

  // Создаем объект Highlight с найденными диапазонами
  const searchResultsHighlight = new Highlight(...ranges);

  // Выделяем найденные фразы или слова с помощью CSS Custom Highlight API
  CSS.highlights.set("search-results", searchResultsHighlight);
}

// Функция для нахождения всех текстовых узлов внутри элемента и его дочерних элементов
function findAllTextNodes(element, nodes = []) {
  if (element.nodeType === Node.TEXT_NODE) {
    nodes.push({ el: element, text: element.textContent.toLowerCase() });
  } else {
    element.childNodes.forEach((child) => {
      findAllTextNodes(child, nodes);
    });
  }
  return nodes;
}

// Функция для нахождения фразы или слова
function findRanges(searchString, allTextNodes) {
  const ranges = [];
  for (const { el, text } of allTextNodes) {
    let startPos = 0;
    while (startPos < text.length) {
      const index = text.indexOf(searchString, startPos);
      if (index === -1) break;
      const range = new Range();
      range.setStart(el, index);
      range.setEnd(el, index + searchString.length);
      ranges.push(range);
      startPos = index + searchString.length;
    }
  }
  return ranges;
}
