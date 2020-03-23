let dbPromise = idb.open('projects-store', 1, (db) => {
    if (!db.objectStoreNames.contains('projects')) {
      db.createObjectStore('projects', {
        keyPath: '_id'
      })
    }
    if (!db.objectStoreNames.contains('sync-projects')) {
      db.createObjectStore('sync-projects', {
        keyPath: '_id'
      })
    }
  })

  function writeData(st, data) {
    return dbPromise
    .then((db) => {
      let transaction = db.transaction(st, 'readwrite')
      let store = transaction.objectStore(st)
      store.put(data)
      return transaction.complete
    })
  }

  function readAllData(st) {
      return dbPromise
        .then((db) => {
            let tx = db.transaction(st, 'readonly')
            let store = tx.objectStore(st)
            return store.getAll()
        })
  }

  function clearAllData(st){
      return dbPromise 
        .then((db) => {
            let tx = db.transaction(st, 'readwrite')
            let store = tx.objectStore(st)
            store.clear()
            return tx.complete
        })
  }

  function clearSingleData(st, id){
      return dbPromise
        .then((db) => {
            let transaction = db.transaction(st, 'readwrite')
            let store = transaction.objectStore(st)
            store.delete(id)
            return transaction.complete
        })
        .then(() => {
            console.log("[Utility] Item " + id + " deleted")
        })
  }

  function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  
    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);
  
    for (var i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }