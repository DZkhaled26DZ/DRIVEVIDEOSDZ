// Initialize global variables
let player;
let channels = [];
let showFavorites = false;

// DOM Elements
const videoPlayer = document.getElementById('videoPlayer');
const channelList = document.getElementById('channelList');
const fileInput = document.getElementById('fileInput');
const urlButton = document.getElementById('urlButton');
const urlModal = document.getElementById('urlModal');
const urlForm = document.getElementById('urlForm');
const urlInput = document.getElementById('urlInput');
const closeModal = document.getElementById('closeModal');
const searchInput = document.getElementById('searchInput');
const toggleFavorites = document.getElementById('toggleFavorites');
const toggleSidebar = document.getElementById('toggleSidebar');
const toast = document.getElementById('toast');

// Initialize Plyr
player = new Plyr('#videoPlayer', {
    controls: [
        'play-large', 'restart', 'rewind', 'play', 'fast-forward', 'progress',
        'current-time', 'duration', 'mute', 'volume', 'captions',
        'settings', 'pip', 'airplay', 'fullscreen'
    ],
    settings: ['captions', 'quality', 'speed', 'loop'],
    keyboard: { focused: true, global: true },
    tooltips: { controls: true, seek: true },
    i18n: {
        restart: 'إعادة التشغيل',
        rewind: 'رجوع 10 ثواني',
        play: 'تشغيل',
        pause: 'إيقاف مؤقت',
        fastForward: 'تقديم 10 ثواني',
        seek: 'بحث',
        played: 'تم التشغيل',
        buffered: 'تم التحميل',
        currentTime: 'الوقت الحالي',
        duration: 'المدة',
        volume: 'مستوى الصوت',
        mute: 'كتم الصوت',
        unmute: 'تشغيل الصوت',
        enableCaptions: 'تفعيل الترجمة',
        disableCaptions: 'إيقاف الترجمة',
        enterFullscreen: 'ملء الشاشة',
        exitFullscreen: 'إنهاء ملء الشاشة',
        frameTitle: 'مشغل لـ {title}',
        captions: 'الترجمة',
        settings: 'الإعدادات',
        speed: 'السرعة',
        normal: 'عادي',
        quality: 'الجودة',
        loop: 'تكرار'
    }
});

// Initialize video players
let hlsPlayer = null;
let dashPlayer = null;
let shakaPlayer = null;

// Helper Functions
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 3000);
}

async function initializePlayer(url) {
    // Clean up existing players
    if (hlsPlayer) {
        hlsPlayer.destroy();
        hlsPlayer = null;
    }
    if (dashPlayer) {
        dashPlayer.destroy();
        dashPlayer = null;
    }
    if (shakaPlayer) {
        shakaPlayer.destroy();
        shakaPlayer = null;
    }

    try {
        // Try HLS.js first
        if (Hls.isSupported() && (url.includes('.m3u8') || url.includes('application/x-mpegURL'))) {
            hlsPlayer = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsPlayer.loadSource(url);
            hlsPlayer.attachMedia(videoPlayer);
            return new Promise((resolve, reject) => {
                hlsPlayer.on(Hls.Events.MANIFEST_PARSED, resolve);
                hlsPlayer.on(Hls.Events.ERROR, reject);
            });
        }
        // Try DASH
        else if (url.includes('.mpd') || url.includes('application/dash+xml')) {
            dashPlayer = dashjs.MediaPlayer().create();
            dashPlayer.initialize(videoPlayer, url, true);
            dashPlayer.updateSettings({
                streaming: {
                    lowLatencyEnabled: true,
                    abr: {
                        useDefaultABRRules: true
                    }
                }
            });
        }
        // Try Shaka Player
        else {
            shakaPlayer = new shaka.Player(videoPlayer);
            await shakaPlayer.load(url);
        }
    } catch (error) {
        console.error('Error initializing player:', error);
        showToast('حدث خطأ أثناء تحميل الفيديو');
    }
}

function parseM3U(content) {
    const lines = content.split('\n');
    const parsedChannels = [];
    let currentChannel = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('#EXTINF:')) {
            const nameMatch = line.match(/,(.+)$/);
            const logoMatch = line.match(/tvg-logo="([^"]+)"/);
            const groupMatch = line.match(/group-title="([^"]+)"/);
            
            if (nameMatch) {
                currentChannel = {
                    id: `channel-${parsedChannels.length + 1}`,
                    name: nameMatch[1].trim(),
                    logo: logoMatch ? logoMatch[1] : null,
                    group: groupMatch ? groupMatch[1] : 'بدون تصنيف',
                    isFavorite: false
                };
            }
        } else if (line && !line.startsWith('#') && currentChannel) {
            currentChannel.url = line;
            parsedChannels.push(currentChannel);
            currentChannel = null;
        }
    }

    return parsedChannels.sort((a, b) => {
        if (a.group === b.group) {
            return a.name.localeCompare(b.name);
        }
        return a.group.localeCompare(b.group);
    });
}

function renderChannelList() {
    const filteredChannels = channels.filter(channel => {
        const matchesSearch = channel.name.toLowerCase().includes(searchInput.value.toLowerCase());
        return showFavorites ? channel.isFavorite && matchesSearch : matchesSearch;
    });

    const groups = {};
    filteredChannels.forEach(channel => {
        if (!groups[channel.group]) {
            groups[channel.group] = [];
        }
        groups[channel.group].push(channel);
    });

    channelList.innerHTML = '';

    Object.entries(groups).forEach(([group, groupChannels]) => {
        const groupElement = document.createElement('div');
        groupElement.className = 'channel-group';
        
        groupElement.innerHTML = `
            <div class="channel-group-header">${group}</div>
            ${groupChannels.map(channel => `
                <div class="channel-item" data-channel-id="${channel.id}">
                    <div class="channel-logo">
                        ${channel.logo ? `<img src="${channel.logo}" alt="" onerror="this.style.display='none'">` 
                                     : channel.name[0]}
                    </div>
                    <span class="channel-name">${channel.name}</span>
                    <button class="favorite-button ${channel.isFavorite ? 'active' : ''}" data-channel-id="${channel.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${channel.isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                    </button>
                </div>
            `).join('')}
        `;

        channelList.appendChild(groupElement);
    });
}

// Event Listeners
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        if (file.type.includes('video')) {
            const url = URL.createObjectURL(file);
            await initializePlayer(url);
            showToast('تم تحميل الفيديو بنجاح');
        } else {
            const text = await file.text();
            channels = parseM3U(text);
            renderChannelList();
            showToast('تم تحميل قائمة القنوات بنجاح');
        }
    } catch (error) {
        console.error('Error processing file:', error);
        showToast('حدث خطأ أثناء معالجة الملف');
    }
});

urlButton.addEventListener('click', () => {
    urlModal.classList.add('active');
    urlInput.focus();
});

closeModal.addEventListener('click', () => {
    urlModal.classList.remove('active');
});

urlForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = urlInput.value.trim();
    if (!url) return;

    try {
        if (url.endsWith('.m3u') || url.endsWith('.m3u8')) {
            const response = await fetch(url);
            const text = await response.text();
            channels = parseM3U(text);
            renderChannelList();
            showToast('تم تحميل قائمة القنوات بنجاح');
        } else {
            await initializePlayer(url);
            showToast('تم تحميل الفيديو بنجاح');
        }
    } catch (error) {
        console.error('Error loading URL:', error);
        showToast('حدث خطأ أثناء تحميل الرابط');
    }

    urlModal.classList.remove('active');
    urlInput.value = '';
});

searchInput.addEventListener('input', renderChannelList);

toggleFavorites.addEventListener('click', () => {
    showFavorites = !showFavorites;
    toggleFavorites.querySelector('svg').style.fill = showFavorites ? 'currentColor' : 'none';
    renderChannelList();
});

toggleSidebar.addEventListener('click', () => {
    channelList.parentElement.style.display = 
        channelList.parentElement.style.display === 'none' ? 'block' : 'none';
});

channelList.addEventListener('click', async (e) => {
    const channelItem = e.target.closest('.channel-item');
    const favoriteButton = e.target.closest('.favorite-button');

    if (favoriteButton) {
        const channelId = favoriteButton.dataset.channelId;
        const channel = channels.find(c => c.id === channelId);
        if (channel) {
            channel.isFavorite = !channel.isFavorite;
            renderChannelList();
        }
        return;
    }

    if (channelItem) {
        const channelId = channelItem.dataset.channelId;
        const channel = channels.find(c => c.id === channelId);
        if (channel) {
            try {
                await initializePlayer(channel.url);
                showToast(`جاري تشغيل: ${channel.name}`);
            } catch (error) {
                console.error('Error playing channel:', error);
                showToast('حدث خطأ أثناء تشغيل القناة');
            }
        }
    }
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Space bar - Play/Pause
    if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        player.togglePlay();
    }
    // F - Toggle Fullscreen
    if (e.code === 'KeyF') {
        player.toggleFullscreen();
    }
    // M - Toggle Mute
    if (e.code === 'KeyM') {
        player.toggleMute();
    }
    // Left Arrow - Rewind
    if (e.code === 'ArrowLeft') {
        player.rewind(10);
    }
    // Right Arrow - Forward
    if (e.code === 'ArrowRight') {
        player.forward(10);
    }
    // Up Arrow - Volume Up
    if (e.code === 'ArrowUp') {
        player.increaseVolume(0.1);
    }
    // Down Arrow - Volume Down
    if (e.code === 'ArrowDown') {
        player.decreaseVolume(0.1);
    }
});

// Handle clicks outside modal
window.addEventListener('click', (e) => {
    if (e.target === urlModal) {
        urlModal.classList.remove('active');
    }
});

// Initialize Shaka Player
shaka.polyfill.installAll();

// Save favorites to localStorage
function saveFavorites() {
    const favorites = channels
        .filter(channel => channel.isFavorite)
        .map(channel => channel.id);
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Load favorites from localStorage
function loadFavorites() {
    try {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        channels.forEach(channel => {
            channel.isFavorite = favorites.includes(channel.id);
        });
        renderChannelList();
    } catch (error) {
        console.error('Error loading favorites:', error);
    }
}

// Auto-save favorites when modified
setInterval(saveFavorites, 1000);

// Initialize DLNA/DMR if available
if ('presentation' in navigator) {
    navigator.presentation.defaultRequest = new PresentationRequest(['cast.html']);
}