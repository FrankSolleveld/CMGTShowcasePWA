/*
Service Worker
created by: Frank Solleveld
*/

importScripts('/src/js/idb.js')
importScripts('/src/js/utility.js')

let CACHE_STATIC_NAME = 'static-v4'
let CACHE_DYNAMIC_NAME = 'dynamic-v1'

let STATIC_FILES = [
    '/',
    '/index.html',
    '/src/js/app.js',
    '/src/js/idb.js',
    '/src/js/utility.js',
    '/src/js/material.min.js',
    '/src/css/styles.css'
]

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing service worker.', event)
    // Opening static cache, waiting until cache is open before going any further.
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then((cache) => {
                console.log('[Service Worker] Precaching App Shell.')
                cache.addAll(STATIC_FILES)
            })
    )
})

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating service worker.', event)
     // Writing cleanup code
    event.waitUntil(
        caches.keys()
        .then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME){
                    console.log('[Service Worker] Removing old cache: ' + key)
                    caches.delete(key)
                }
            }))
        })
    )
    return self.clients.claim()
})

// This will eventually help us check if the specific element is already in the cache
function isInArray(string, array) {
    for (let i; i < array.length; i++) {
      if (array[i] === string) {
        return true
      }
    }
    return false
  }

  self.addEventListener('fetch', (event) => {
      // Cache then network strategy
      console.log('[Service Worker] Fetching something ....', event);
      let url = 'https://cmgt.hr.nl:8000/api/projects/'
      if (event.request.url.indexOf(url) > -1){
          event.respondWith(
              fetch(event.request)
                .then((res) => {
                    let clonedRes = res.clone()
                    console.log(res)
                    // clearing sorage before repopulating
                    clearAllData('projects')
                        .then(() => {
                            return clonedRes.json()
                        })
                        .then((data) => {
                            for (let key in data){
                                writeData('projects', data[key])
                            }
                        })
                        return res
                })
          )
      } else if (isInArray(event.request.url, STATIC_FILES)){
          event.respondWith(
              caches.match(event.request)
          )
      } else {
          // Cache with network fallback
          event.respondWith(
              caches.match(event.request)
                .then((response) => {
                    if (response) {
                        return response
                    } else {
                        return fetch(event.request)
                            .then((res) => { 
                                // response from srv
                                return caches.open(CACHE_DYNAMIC_NAME)
                                    .then((cache) => {
                                        cache.put(event.request.url, res.clone())
                                        return res
                                    })
                            })
                            .catch((err) => {
                                return caches.open(CACHE_STATIC_NAME)
                                    .then((cache) => {
                                        if(event.request.headers.get('accept').includes('text/html')) {
                                            return cache.match('/offline.html')
                                        }
                                    })
                            })
                    }
                })
          )
      }
  })