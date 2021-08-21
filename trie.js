class Node {
  constructor(key) {
    this.key = key; // the value of the node
    this.child = {}; // children of this node
    this.endingWord = false; // boolean to track if any word ends at this node
    this.parent = null; // points the parent
    this.childCount = 0; // number of children, used while removing the nodes
  }
}

class Trie {
  constructor() {
    this.root = new Node("");
  }

  addToList(inputWord, addingWords) {
    // function to add input to the trie data structure
    var temp = this.root;
    const lowered = inputWord.toLowerCase(); // lowering all the inputs so that there wont be more than one copy of same word
    var word = "";
    for (var i = 0; i < lowered.length; i++) {
      if(addingWords){ // condition to check if we are adding all the words to the list or not
        if(lowered[i] == " "){
          this.addWords(word);
          word = "";
        } else if(i == lowered.length - 1){
          var t = word + lowered[i];
          this.addWords(t);
          word = "";
        } else{
          word = word + lowered[i];
        }
      }
      if (!temp.child[lowered[i]]) {
        temp.child[lowered[i]] = new Node(lowered[i]);
        temp.childCount++;
      }
      temp.child[lowered[i]].parent = temp;
      temp = temp.child[lowered[i]];
    }
    temp.endingWord = true;
  }

  addWords(lowered){ // function to add particular word to the trie
    var temp = this.root;
    for(var i = 0; i< lowered.length; i++){
      if(!temp.child[lowered[i]]){
        temp.child[lowered[i]] = new Node(lowered[i]);
        temp.childCount++;
      }
      temp.child[lowered[i]].parent = temp;
      temp = temp.child[lowered[i]];
    }
    temp.endingWord = true;
  }

  remove(inputWord) { // function to remove input words from the trie
    var temp = this.search(inputWord);
    if (temp) {
      temp.endingWord = false;
      while (temp != this.root && temp.childCount == 1) {
        var k = temp.key;
        temp = temp.parent;
        delete temp.child[k];
        temp.childCount--;
      }
    }
  }

  backTrack(start, end) {
    // start is the node upto which the backTracking is done
    var word = "";
    var temp = end; // end is the leaf node from where backtracking is to be done
    while (temp != start) {
      word = temp.key + word;
      temp = temp.parent;
    }
    return word; // return the word starting from 'start' node to the 'end' node
  }

  // search function takes the input and returns null when the word is not in the list 
  search(inputWord) { // and returns the last letter's node if the word is on the list
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

  // returns true if the input word is on the list and the last letter is a word ending letter else it will return false
  isWord(inputWord) {
    const lowered = inputWord.toLowerCase();
    var temp = this.search(lowered);
    if (temp) {
      return temp.endingWord;
    }
    return false;
  }

  // startNode is the node of the letter from where the user input ends and currentNode is the node for tracking if the node is endingWord's node or not
  autoCompleteSentence(startNode, suggestions, currentNode) {
    // suggestions is the array for storing the results from auto complete
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
        suggestions.push(this.backTrack(startNode, currentNode)); // returns the word starting from startNode to currentNode
      }
    }
  }

  autoCompleteWord(startNode, suggestions, currentNode) { //shows one word suggestions to the input
    if (currentNode) {
      if (currentNode.endingWord) {
        suggestions.push(this.backTrack(this.root, currentNode)); // returns the actual word on the trie
      }
      for (var children in currentNode.child) {
        if (children != " ") {
          // this condition is for showing only one word suggestion i.e after space comes the list is discarded
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
let suggestionsDiv = document.getElementById("srchSuggestions");
let chatBar = document.getElementById("chatBar");
let chatSuggestionsDiv = document.getElementById("chatSuggestions");
let spellBar = document.getElementById("spellBar");
let spellImage = document.getElementById("spellImage"); // Image to show if the word is rightly spelled or wrong

document.addEventListener("click", (e) => {
  // to make the suggestions div disappear if not active
  if (document.activeElement != chatBar) {
    chatSuggestionsDiv.innerHTML = "";
  }
  if (document.activeElement != searchBar) {
    suggestionsDiv.innerHTML = "";
  }
});

var searchTrie = new Trie();

var addingWords = false;

// adding datas to the searchTrie
// we are not adding each word from the input so addingWords is false;
searchTrie.addToList("Why aren't there people on saturn?", addingWords);
searchTrie.addToList("How did the first human originate?", addingWords);
searchTrie.addToList("Why is water 'water'?", addingWords);
searchTrie.addToList("How can I be more handsome?", addingWords);

searchBar.addEventListener("input", (e) => { // called whenever the user changes the searchBar field
  suggestionsDiv.innerHTML = "";
  var searchSuggestions = [];
  var startNode = searchTrie.search(e.target.value);
  searchTrie.autoCompleteSentence(startNode, searchSuggestions, startNode);

  for (var i = 0; i < searchSuggestions.length; i++) { // for every suggestion, creating a list on the webpage
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
addingWords = true;

// we are adding each word from the input so addingWords is true
chatTrie.addToList("blast party", addingWords);
chatTrie.addToList("covert", addingWords);
chatTrie.addToList("blunder", addingWords);
chatTrie.addToList("copy", addingWords);

chatBar.addEventListener("input", (e) => { // called whenever chatBar field changes
  chatSuggestionsDiv.innerHTML = "";
  var searchSuggestions = [];
  var lastTyping = "";
  var wordLength = e.target.value.length;
  var noSpace = true;

  while (wordLength != 0 && noSpace) { // to separate words
    if (e.target.value[wordLength - 1] == " ") {
      noSpace = false;
    } else {
      lastTyping = e.target.value[wordLength - 1] + lastTyping;
      wordLength--;
    }
  }
  // lastTyping stores the latest typing word from the input

  if (lastTyping[0] != " " || lastTyping != "") { // this condition is to get suggestion only after the user starts to type a new word
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
    spellImage.src = "../images/tickmark.png";
  } else {
    spellImage.src = "../images/crossmark.png";
  }
});

spellBar.addEventListener("input", (e) => {
  spellImage.src = "../images/check.png";
  spellBar.textContent = e.target.value;
});
