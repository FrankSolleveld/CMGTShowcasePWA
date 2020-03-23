/*
Service Worker
created by: Frank Solleveld
*/

let CACHE_STATIC_NAME = 'static-v3  '
let CACHE_DYNAMIC_NAME = 'dynamic-v1'

let STATIC_FILES = [
    '/',
    '/index.html',
    '/src/js/app.js',
    '/src/js/material.min.js',
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