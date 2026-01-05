const BACKEND = "34.162.165.233";

let form = document.getElementById("text-input");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  let formData = new FormData(form);
  let msg = formData.get("query");
  if (msg.length > 0) {
    form.reset();
    sendNewMessage(msg);
  }
});

function displayNewMessage(msg, bot) {
  let chats = document.getElementById("chat-messages");

  let messageNode = document.createElement("div");
  let type = bot ? "chat-message-from" : "chat-message-to";
  messageNode.className = `chat-message ${type}`;

  let text = document.createElement("p");
  text.textContent = msg;
  messageNode.append(text);

  chats.prepend(messageNode);
}

const displayUserMessage = (msg) => displayNewMessage(msg, false);
const displayBotMessage = (msg) => displayNewMessage(msg, true);

function displayArticles(msg, results) {
  let chats = document.getElementById("chat-messages");

  let messageNode = document.createElement("div");
  messageNode.className = "chat-message chat-message-from";

  let text = document.createElement("p");
  text.textContent = msg;
  messageNode.append(text);
  
  let searchResults = renderSearchResults(results);
  messageNode.append(...searchResults);

  chats.prepend(messageNode);
}

function renderSearchResults(results) {
  function renderArticle(article) {
    let articleNode = document.createElement("div");
    articleNode.className = "article";
   
    let title = document.createElement("h3");
    title.textContent = article.title;
    articleNode.append(title);

    let url = document.createElement("a");
    url.href = article.url;
    url.target = "_blank";
    url.textContent = article.url;
    articleNode.append(url);

    let summary = document.createElement("details");
    let cue = document.createElement("summary");
    cue.textContent = "Read abstract";
    summary.append(cue);

    let description = document.createElement("p");
    description.textContent = article.summary;
    summary.append(description);
    articleNode.append(summary);

    return articleNode;
  }

  function renderTopic(topicName, articles) {
    let topic = document.createElement("div");
    topic.className = "topic";

    let label = document.createElement("h2");
    label.textContent = topicName[0].toUpperCase() + topicName.slice(1);
    topic.append(label);

    let list = articles.map(renderArticle);
    topic.append(...list);

    return topic;
  }

  return Object.entries(results)
               .map(entry => renderTopic(entry[0], entry[1]));
}

async function sendNewMessage(msg) {
  displayUserMessage(msg);

  let json = JSON.stringify({ query: msg });
  try {
    let response = await fetch(`http://${BACKEND}:9999/search`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: json,
    });
    if (response.ok) {
      let json = await response.json();
      let answer = json.text;
      let results = json.results;

      if (results) {
        displayArticles(answer, results);
      } else {
        displayBotMessage(answer);
      }
    }

  } catch (error) {
    console.error(error);
  }
}


