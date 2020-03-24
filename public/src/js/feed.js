let projectsArea = document.querySelector('#projects');
let cmgtUrl = 'https://cmgt.hr.nl:8000/'
// console.log('Start of Feed JS')

// show PWA question
if (deferredPrompt) {
  deferredPrompt.prompt();

  deferredPrompt.userChoice.then(function (choiceResult) {
    console.log(choiceResult.outcome);

    if (choiceResult.outcome === 'dismissed') {
      console.log('User cancelled installation');
    } else {
      console.log('User added to home screen');
    }
  });
  deferredPrompt = null;
}

function clearCards() {
  while (projectsArea.hasChildNodes()) {
    projectsArea.removeChild(projectsArea.lastChild)
  }
}

function createCard(data) {
  let cardWrapper = document.createElement('div');
  cardWrapper.className = 'projects-card mdl-card mdl-shadow--2dp';
  let cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url(' + cmgtUrl + data.headerImage + ')';
  cardTitle.style.backgroundSize = 'cover';
  cardWrapper.appendChild(cardTitle);
  let cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white'
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  let cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.author;
  cardSupportingText.style.textAlign = 'center';
  // let cardSaveButton = document.createElement('button')
  // cardSaveButton.textContent = 'Save'
  // cardSaveButton.addEventListener('click', onSaveButtonClicked)
  // cardSupportingText.appendChild(cardSaveButton)
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  projectsArea.appendChild(cardWrapper);
}

function createTagsList(data){
  
}

function updateUI(data) {
  clearCards()
  for (let i = 0; i < data.length; i++) {
    createCard(data[i])
  }
}

self.addEventListener('offline', (event) => {
  console.log('the network connection has been lost')
  createOfflineNotification()
})

self.addEventListener('online', (event) => {
  console.log('the network connection is established.')
  clearOfflineNotification()
})

// call naar /projects
let url = 'https://cmgt.hr.nl:8000/api/projects'
let networkDataReceived = false

fetch(url)
  .then((res) => {
    return res.json()
  })
  .then((data) => {
    let projectsData = data.projects
    for (let i = 0; i < projectsData.length; i++) {
      writeData('projects', projectsData[i])
    }
    console.log('[Feed.js] Data has been stored into the DB and fetched from the server.')
    networkDataReceived = true
    return projectsData
  })
  .then((data) => {
    updateUI(data)
  })
  .catch((err) => {
    console.log('[Feed.js] We have encountered an error...', err)
    if (!navigator.onLine){
      createOfflineNotification()
    }
  })

  fetch('https://cmgt.hr.nl:8000/api/projects/tags')
    .then((res) => {
      return res.json()
    })
    .then((data) => {
      let tagData = data.tags
    })

if ('indexedDB' in window) {
  readAllData('projects')
    .then((data) => {
      // Wanneer er vanuit het netwerk is geladen, wordt dit niet uitgevoerd, wanneer dit niet zo is, wordt dit wel uitgevoerd. De gegevens worden dan uit IndexedDB gehaald.
      if (!networkDataReceived) {
        updateUI(data)
        console.log('[Feed.js] Data has been retrieved out of IndexDB.')
      }
    })
}