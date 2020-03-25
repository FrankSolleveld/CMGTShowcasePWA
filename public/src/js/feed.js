let projectsArea = document.querySelector('#projects')
let tagsArea = document.querySelector('#tags')
let cmgtUrl = 'https://cmgt.hr.nl:8000/'
let downloadButton = document.getElementById('download')
let caption = document.getElementById('caption')

function clearCards() {
  while (projectsArea.hasChildNodes()) {
    projectsArea.removeChild(projectsArea.lastChild)
  }
}

function createCard(data) {
  let cardWrapper = document.createElement('div')
  cardWrapper.className = 'projects-card mdl-card mdl-shadow--2dp'

  let cardTitle = document.createElement('div')
  cardTitle.className = 'mdl-card__title'
  cardTitle.style.backgroundImage = 'url(' + cmgtUrl + data.headerImage + ')'
  cardTitle.style.backgroundSize = 'cover'
  cardWrapper.appendChild(cardTitle)

  let cardTitleTextElement = document.createElement('h2')
  cardTitleTextElement.style.color = 'white'
  cardTitleTextElement.className = 'mdl-card__title-text'
  cardTitleTextElement.textContent = data.title
  cardTitle.appendChild(cardTitleTextElement)

  let cardSupportingText = document.createElement('div')
  cardSupportingText.className = 'mdl-card__supporting-text support'
  cardSupportingText.textContent = data.author
  cardSupportingText.style.textAlign = 'center'

  let cardDescription = document.createElement('p')
  cardDescription.style.color = 'black'
  cardDescription.style.fontSize = '18px'
  cardDescription.className = 'mdl-card__title-text'
  cardDescription.textContent = data.description
  cardSupportingText.appendChild(cardDescription)

  let cardTagTextElement = document.createElement('p')
  cardTagTextElement.style.color = 'black'
  cardTagTextElement.style.fontSize = '18px'
  cardTagTextElement.className = 'mdl-card__title-text'
  cardTagTextElement.textContent = "Tags: " + data.tags
  cardSupportingText.appendChild(cardTagTextElement)

  cardWrapper.appendChild(cardSupportingText)
  componentHandler.upgradeElement(cardWrapper)
  projectsArea.appendChild(cardWrapper)
}

function createTagsList(tag) {
  caption.style.display = 'block'
  let listItemElement = document.createElement('p')
  listItemElement.className = 'mdc-list-item mdc-layout-grid__cell--span-3'
  let itemTextElement = document.createElement('span')
  itemTextElement.className = 'mdc-list-item__text'
  itemTextElement.textContent = tag

  listItemElement.appendChild(itemTextElement)

  tagsArea.appendChild(listItemElement)
}

function updateUI(data) {
  clearCards()
  for (let i = 0; i < data.length; i++) {
    createCard(data[i])
  }
}

self.addEventListener('offline', (event) => {
  console.log('the network connection has been lost')
  caption.style.display = 'none'
  tagsArea.style.display = 'none'
  createOfflineNotification()
})

self.addEventListener('online', (event) => {
  console.log('the network connection is established.')
  clearOfflineNotification()
})

if (downloadButton) {
  downloadButton.addEventListener('click', e => {
    deferredPrompt.prompt()
    deferredPrompt.userChoice
      .then(choiceResult => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User installed.')
        } else {
          console.log('user dismissed')
        }
        deferredPrompt = null
      })
  })
}

// call naar /projects
let url = 'https://cmgt.hr.nl:8000/api/projects'
let networkDataReceived = false

fetch(url)
  .then((res) => {
    return res.json()
  })
  .then((data) => {
    clearAllData('projects')
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
    if (!navigator.onLine) {
      createOfflineNotification()
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
    }
  })

// TODO: Finish tag script
fetch('https://cmgt.hr.nl:8000/api/projects/tags')
  .then((res) => {
    return res.json()
  })
  .then((data) => {
    let tagData = data.tags
    for (let i = 0; i < tagData.length; i++) {
      createTagsList(tagData[i])
    }
  })
  .catch((err) => {
    caption.style.display = 'none'
    console.log('[Feed.js] Encountered an error while fetching tags', err)
  })