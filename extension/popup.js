
var button = document.getElementById('toggle')

function toggleOverlay(event) {
  sendToCurrentTab({action: "toggle"}, function(response) {
    setStatus(response.active)
  })
}

function sendToCurrentTab(message, callback) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, message, callback)
  });
}

var active = false
function getStatus() {
  sendToCurrentTab({action: "status"}, function(response) {
    setStatus(response.active)
  })
}

function setStatus(status) {
  active = status
  button.innerHTML = active ? 'Disable' : 'Enable'
}

getStatus()

button.addEventListener('click', toggleOverlay)
