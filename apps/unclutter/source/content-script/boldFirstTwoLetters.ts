export function boldFirstTwoLetters() {
    function traverseNodes(node: Node) {
        switch(node.nodeType) {
            case Node.ELEMENT_NODE:
                for (let childNode of node.childNodes) {
                    traverseNodes(childNode);
                }
                break;
            case Node.TEXT_NODE:
                const textContent = node.textContent ?? '';
                const updatedContent = textContent.split(' ').map(word => {
                    return word.length >= 2 
                        ? `<b>${word.slice(0, 2)}</b>${word.slice(2)}`
                        : word;
                }).join(' ');

                const newContainer = document.createElement('span');
                newContainer.innerHTML = updatedContent;
                node.parentNode?.replaceChild(newContainer, node);
                break;
        }
    }

    traverseNodes(document.body);
}
