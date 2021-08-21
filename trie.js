class Node {
  constructor(key) {
    this.key = key;
    this.child = {};
    this.endingWord = false;
    this.parent = null;
    this.childCount = 0;
  }
}

class Trie {
  constructor() {
    this.root = new Node("");
  }
  addToList(inputWord) {
    var temp = this.root;
    const lowered = inputWord.toLowerCase();
    // var word = "";
    for (var i = 0; i < lowered.length; i++) {
      if (!temp.child[lowered[i]]) {
        temp.child[lowered[i]] = new Node(lowered[i]);
        temp.childCount++;
      }
      temp.child[lowered[i]].parent = temp;
      temp = temp.child[lowered[i]];
    }
    temp.endingWord = true;
  }

  remove(inputWord) {
    var temp = this.search(inputWord);
    if (temp) {
      temp.endingWord = false;
      if (temp.childCount == 0) {
        while (temp != this.root && temp.childCount < 2) {
          var k = temp.key;
          temp = temp.parent;
          delete temp.child[k];
          temp.childCount--;
        }
      }
    }
  }

  backTrack(start, end) {
    var word = "";
    var temp = end;
    while (temp != start) {
      word = temp.key + word;
      temp = temp.parent;
    }
    return word;
  }

  search(inputWord) {
    const lowered = inputWord.toLowerCase();
    var temp = this.root;
    for (var i = 0; i < lowered.length; i++) {
      if (temp.child[lowered[i]]) {
        temp = temp.child[lowered[i]];
      } else {
        return null;
      }
    }
    return temp;
  }

  isWord(inputWord) {
    const lowered = inputWord.toLowerCase();
    var temp = this.search(lowered);
    if (temp) {
      return temp.endingWord;
    }
    return false;
  }

  autoCompleteSentence(startNode, suggestions, currentNode) {
    if (currentNode) {
      var hasChild = false;
      for (var children in currentNode.child) {
        hasChild = true;
        this.autoCompleteSentence(
          startNode,
          suggestions,
          currentNode.child[children]
        );
      }
      if (!hasChild) {
        suggestions.push(this.backTrack(startNode, currentNode));
      }
    }
  }

  autoCompleteWord(startNode, suggestions, currentNode) {
    if (currentNode) {
      if (currentNode.endingWord) {
        suggestions.push(this.backTrack(this.root, currentNode));
      }
      for (var children in currentNode.child) {
        if (children != " ") {
          this.autoCompleteWord(
            startNode,
            suggestions,
            currentNode.child[children]
          );
        }
      }
    }
  }
}

let searchBar = document.getElementById("searchBar");
let chatBar = document.getElementById("chatBar");
let chatSuggestionsDiv = document.getElementById("chatSuggestions");
let spellBar = document.getElementById("spellBar");
let suggestionsDiv = document.getElementById("srchSuggestions");
let spellImage = document.getElementById("spellImage");

document.addEventListener("click", (e) => {
  if (document.activeElement != chatBar) {
    chatSuggestionsDiv.innerHTML = "";
  }
  if (document.activeElement != searchBar) {
    suggestionsDiv.innerHTML = "";
  }
});

var searchTrie = new Trie();

searchTrie.addToList("Why aren't there people on saturn?");
searchTrie.addToList("How did the first human originate?");
searchTrie.addToList("Why is water 'water'?");
searchTrie.addToList("How can I be more handsome?");

searchBar.addEventListener("input", (e) => {
  suggestionsDiv.innerHTML = "";
  var searchSuggestions = [];
  var startNode = searchTrie.search(e.target.value);
  searchTrie.autoCompleteSentence(startNode, searchSuggestions, startNode);
  for (var i = 0; i < searchSuggestions.length; i++) {
    let sugg = document.createElement("li");
    sugg.textContent = e.target.value + searchSuggestions[i];
    sugg.addEventListener("click", (event) => {
      e.target.value = "" + event.target.textContent;
      suggestionsDiv.innerHTML = "";
    });
    suggestionsDiv.appendChild(sugg);
  }
});

var chatTrie = new Trie();

chatTrie.addToList("blast");
chatTrie.addToList("covert");
chatTrie.addToList("blunder");
chatTrie.addToList("copy");

chatBar.addEventListener("input", (e) => {
  chatSuggestionsDiv.innerHTML = "";
  var searchSuggestions = [];
  var lastTyping = "";
  var wordLength = e.target.value.length;
  var noSpace = true;

  while (wordLength != 0 && noSpace) {
    if (e.target.value[wordLength - 1] == " ") {
      noSpace = false;
    } else {
      lastTyping = e.target.value[wordLength - 1] + lastTyping;
      wordLength--;
    }
  }

  if (lastTyping[0] != " " || lastTyping != "") {
    var startNode = chatTrie.search(lastTyping);
    chatTrie.autoCompleteWord(startNode, searchSuggestions, startNode);
    for (var i = 0; i < searchSuggestions.length; i++) {
      let sugg = document.createElement("div");
      let delSugg = document.createElement("div");

      sugg.classList = "first";
      delSugg.classList = "second";
      delSugg.textContent = "×";
      sugg.textContent = searchSuggestions[i];

      sugg.addEventListener("click", (event) => {
        e.target.value = "" + event.target.textContent;
        chatSuggestionsDiv.innerHTML = "";
      });

      delSugg.addEventListener("click", (e) => {
        e.preventDefault();
        chatTrie.remove(sugg.textContent);
        chatSuggestionsDiv.innerHTML = "";
      });

      let suggContainer = document.createElement("div");
      suggContainer.classList = "chatContainer";
      suggContainer.appendChild(sugg);
      suggContainer.appendChild(delSugg);
      chatSuggestionsDiv.appendChild(suggContainer);
    }
  }
});

spellImage.addEventListener("click", (e) => {
  if (chatTrie.isWord(spellBar.textContent)) {
    spellImage.src = "./tickmark.png";
  } else {
    spellImage.src = "./crossmark.png";
  }
});

spellBar.addEventListener("input", (e) => {
  spellImage.src = "./check.png";
  spellBar.textContent = e.target.value;
});
