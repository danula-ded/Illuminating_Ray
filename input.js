const root = document.getElementById("root");
const siteSearch = document.getElementById("site-search");
const selectTest = document.getElementById("tests-select");

siteSearch.addEventListener("input", highlight);
selectTest.addEventListener("change", highlight);

function highlight() {
  if (!CSS.highlights) {
    root.textContent = "CSS Custom Highlight API не поддерживается.";
    return;
  }

  CSS.highlights.clear();

  const searchString = siteSearch.value.trim().toLowerCase();
  if (!searchString) {
    return;
  }
  // Находим все текстовые узлы внутри корневого элемента и его дочерних элементов.
  const allTextNodes = findAllTextNodes(root);

  let ranges = [];

  // Ищем фразу как целое слово.
  const phraseRanges = findPhraseRanges(searchString, allTextNodes);
  ranges.push(...phraseRanges);

  // Если фраза не найдена, ищем отдельные слова из фразы.
  const searchWords = searchString.split(/\s+/);
  const wordRanges = findWordRanges(searchWords, allTextNodes);
  ranges.push(...wordRanges);

  const searchResultsHighlight = new Highlight(...ranges);

  CSS.highlights.set("search-results", searchResultsHighlight);
}

// Функция для нахождения фразы как целого слова.
function findPhraseRanges(phrase, allTextNodes) {
  const ranges = [];
  for (const { el, text } of allTextNodes) {
    let startPos = 0;
    while (startPos < text.length) {
      const index = text.indexOf(phrase, startPos);
      if (index === -1) break;
      const range = new Range();
      range.setStart(el, index);
      range.setEnd(el, index + phrase.length);
      ranges.push(range);
      startPos = index + phrase.length;
    }
  }
  return ranges;
}

// Функция для нахождения диапазонов отдельных слов из фразы.
function findWordRanges(words, allTextNodes) {
  const ranges = [];
  for (const word of words) {
    for (const { el, text } of allTextNodes) {
      let startPos = 0;
      while (startPos < text.length) {
        const index = text.indexOf(word, startPos);
        if (index === -1) break;
        const range = new Range();
        range.setStart(el, index);
        range.setEnd(el, index + word.length);
        ranges.push(range);
        startPos = index + word.length;
      }
    }
  }
  return ranges;
}

// Функция для нахождения всех текстовых узлов внутри элемента и его дочерних элементов.
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
