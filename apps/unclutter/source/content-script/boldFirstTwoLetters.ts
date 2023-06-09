export function boldFirstTwoLetters(fontWeight: string) {
    console.log("boldFirstTwoLetters() function called");
  
    const style = document.createElement('style');
    style.textContent = `
      .bolded-text {
        font-weight: ${fontWeight};
      }
    `;
    document.head.appendChild(style);
  
    const wordRegex = /\b(\w{2})\w*\b/g;
  
    function traverseNodes(node) {
      switch (node.nodeType) {
        case Node.ELEMENT_NODE:
          const elementNode = node;
          const childNodes = Array.from(elementNode.childNodes);
          childNodes.forEach(childNode => {
            traverseNodes(childNode);
          });
          break;
        case Node.TEXT_NODE:
          const textNode = node;
          const text = textNode.textContent;
          const parentElement = textNode.parentElement;
  
          const replacedContent = text.replace(wordRegex, match => {
            const firstTwoLetters = match.substring(0, 2);
            const restOfWord = match.substring(2);
            return `<span class="bolded-word"><span class="bolded-text">${firstTwoLetters}</span>${restOfWord}</span>`;
          });
  
          const tempElement = document.createElement('div');
          tempElement.innerHTML = replacedContent;
  
          while (tempElement.firstChild) {
            parentElement.insertBefore(tempElement.firstChild, textNode);
          }
  
          parentElement.removeChild(textNode);
          break;
      }
    }
  
    traverseNodes(document.body);
  }
  
  export function removeBoldFirstTwoLetters() {
    console.log("removeBoldFirstTwoLetters() function called");
  
    const boldedWords = document.querySelectorAll('.bolded-word');
  
    boldedWords.forEach(word => {
      const wordText = word.textContent;
      const textNode = document.createTextNode(wordText);
      word.parentNode.replaceChild(textNode, word);
    });
  
    const styles = document.head.querySelectorAll('style');
    styles.forEach(style => {
      if (style.textContent.includes('.bolded-text')) {
        document.head.removeChild(style);
      }
    });
  }
  
  export function updateBoldedText(fontWeight) {
    const boldedText = document.querySelectorAll('.bolded-text');
    boldedText.forEach(span => {
      span.style.fontWeight = fontWeight;
    });
  }
  