let projectsArea = document.querySelector('#projects');
let cmgtUrl = 'https://cmgt.hr.nl:8000/'

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
    cardTitle.style.backgroundImage = 'url('+ cmgtUrl + data.headerImage + ')';
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
  
  function updateUI(data) {
    clearCards()
    for (let i = 0; i < data.length; i++) {
      createCard(data[i])
    }
  }

// call naar /projects
let url = 'https://cmgt.hr.nl:8000/api/projects'
let networkDataReceived = false

fetch(url)
  .then((res) => {
    return res.json()
  })
  .then((data) => {
    let projectsData = data.projects
    for(let i = 0; i < projectsData.length; i++){
      writeData('projects', projectsData[i])
    }
    networkDataReceived
    return projectsData
  })
  .then((data) => {
    updateUI(data)
  })

if ('indexedDB' in window) {
  readAllData('projects')
    .then((data) => {
      if(!networkDataReceived){
        console.log('From cache,', data)
        updateUI(data)
      }
    })
}