// Configuration
const CONFIG = {
    YOUTUBE_API_URL: 'https://www.youtube.com/iframe_api',
    IFRAME_RELOAD_DELAY: 100
};

// Gestion des players YouTube
let players = {};

// Utilitaires
const VideoUtils = {
    reloadIframe: (iframe) => {
        if (!iframe) return;
        const originalSrc = iframe.src.split('?')[0];
        iframe.src = '';
        setTimeout(() => {
            iframe.src = originalSrc + '?enablejsapi=1&autoplay=0';
        }, CONFIG.IFRAME_RELOAD_DELAY);
    },

    stopAllVideos: () => {
        const lightbox = document.querySelector('.video-lightbox:target');
        if (!lightbox) return;
        
        lightbox.querySelectorAll('iframe').forEach(VideoUtils.reloadIframe);
    }
};

// Gestion des players YouTube
function onYouTubeIframeAPIReady() {
    document.querySelectorAll('.video-lightbox iframe').forEach(iframe => {
        const playerId = iframe.id;
        players[playerId] = new YT.Player(playerId, {
            events: {
                'onReady': () => console.log('Player YouTube prêt'),
                'onStateChange': (event) => {
                    if (!document.querySelector('.video-lightbox:target')) {
                        const player = event.target;
                        player.stopVideo();
                        VideoUtils.reloadIframe(player.getIframe());
                    }
                }
            }
        });
    });
}

function destroyAllPlayers() {
    Object.values(players).forEach(player => {
        try {
            if (player) {
                player.stopVideo();
                player.destroy();
            }
        } catch (e) {
            console.log('Erreur lors de la destruction du player:', e);
        }
    });
    players = {};
}

function stopVideoAndCloseLightbox() {
    VideoUtils.stopAllVideos();
    destroyAllPlayers();
    window.location.hash = '';
}

// Gestionnaires d'événements
const EventHandlers = {
    setupNavigationEvents: () => {
        window.addEventListener('popstate', stopVideoAndCloseLightbox);
        window.addEventListener('hashchange', () => {
            if (!window.location.hash) {
                destroyAllPlayers();
            }
        });
    },

    setupLightboxEvents: () => {
        // Fermeture par bouton
        document.querySelectorAll('.close-lightbox')
            .forEach(button => button.addEventListener('click', stopVideoAndCloseLightbox));

        // Fermeture par clic en dehors
        document.querySelectorAll('.video-lightbox')
            .forEach(lightbox => {
                lightbox.addEventListener('click', (e) => {
                    if (e.target === lightbox) {
                        stopVideoAndCloseLightbox();
                    }
                });
            });

        // Fermeture par touche Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                stopVideoAndCloseLightbox();
            }
        });
    },

    init: () => {
        // Charge l'API YouTube
        const tag = document.createElement('script');
        tag.src = CONFIG.YOUTUBE_API_URL;
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        EventHandlers.setupLightboxEvents();
        EventHandlers.setupNavigationEvents();
    }
};

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', EventHandlers.init);
