
var button = document.getElementById('toggle')

function toggleOverlay(event) {
  console.log('toggleOverlay')
  sendToCurrentTab({action: "toggle"}, function(response) {
    active = response.active
  })
}

function sendToCurrentTab(message, callback) {
  console.log('sending', message)
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, message, function(response){
      console.log('res', response)
    })
  });
}

var active = false
function getStatus() {
  sendToCurrentTab({action: "status"}, function(response) {
    console.log('response', response)
    active = response.active
  })
}

getStatus()

button.addEventListener('click', toggleOverlay)
button.innerHTML = active ? 'disable' : 'enable'
