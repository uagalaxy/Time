const CACHE_NAME = 'daily-rhythm-cache-v2'; // Increment cache version for updates
const urlsToCache = [
    '/',
    '/index.html', // Main HTML file
    // Assuming CSS and JS are inline or separate files. If inline, they are part of index.html.
    // If you extract CSS to style.css and JS to script.js, uncomment these:
    // '/style.css',
    // '/script.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap',
    'https://fonts.gstatic.com', // Needed for Inter font
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
    'https://placehold.co/64x64/000000/FFFFFF?text=🔔', // Notification icon
    '/manifest.json',
    'https://placehold.co/48x48/000000/FFFFFF?text=DR',
    'https://placehold.co/72x72/000000/FFFFFF?text=DR',
    'https://placehold.co/96x96/000000/FFFFFF?text=DR',
    'https://placehold.co/144x144/000000/FFFFFF?text=DR',
    'https://placehold.co/192x192/000000/FFFFFF?text=DR',
    'https://placehold.co/512x512/000000/FFFFFF?text=DR'
];

// Install event: caches the app shell
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install event');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching app shell');
                // Use a try-catch for addAll to log specific failures
                return cache.addAll(urlsToCache.filter(url => url.startsWith('http') || url.startsWith('/'))).catch(error => {
                    console.error('[Service Worker] Failed to cache some URLs during install:', error);
                    // Continue even if some URLs fail (e.g., external resources not always available)
                });
            })
            .catch(error => {
                console.error('[Service Worker] Failed to open cache during install:', error);
            })
    );
});

// Fetch event: serves cached content or fetches from network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached response if found
                if (response) {
                    // console.log(`[Service Worker] Serving from cache: ${event.request.url}`);
                    return response;
                }
                // Otherwise, fetch from network
                // console.log(`[Service Worker] Fetching from network: ${event.request.url}`);
                return fetch(event.request).catch(error => {
                    console.error(`[Service Worker] Fetch failed for ${event.request.url}:`, error);
                    // You could return an offline page here if desired
                    throw error;
                });
            })
    );
});

// Activate event: cleans up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activate event');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// No server-side push notification logic here, as it requires a backend.
// The current notifications are client-side (set by setTimeout in main script).

// Basic notification click handling (for browser-triggered notifications)
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked:', event.notification);
    event.notification.close(); // Close the notification

    // Focus on an existing client or open a new one
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            // If no open client, open a new window
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

