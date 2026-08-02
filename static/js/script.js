document.addEventListener('DOMContentLoaded', function () {
    
    // --- בחירת האלמנטים ---
    const audioPlayer = document.getElementById('audio-player');
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const video = document.getElementById('background-video');
    const gif = document.getElementById('background-gif');
    const switchBtn = document.getElementById('toggle-background');
    const channelEffect = document.getElementById('channel-switch-effect');
    
    // האלמנט החדש שמציג את המספרים
    const channelDisplay = document.getElementById('channel-display');

    // ערוץ 1 = moonwalk, ערוץ 2 = video1
    const channelVideos = [
        'static/videos/moonwalk.mp4',
        'static/videos/video1.mp4'
    ];
    let currentChannel = 1;

    if (channelDisplay) {
        channelDisplay.textContent = 'CH ' + currentChannel.toString().padStart(2, '0');
    }

    function playChannel(channelNumber) {
        const src = channelVideos[channelNumber - 1];
        if (!video || !src) return;

        if (gif) gif.style.display = 'none';
        video.style.display = 'block';

        const source = video.querySelector('source');
        if (source) source.src = src;
        video.src = src;
        video.load();
        video.play().catch(function () {});
    }

    function switchBackground() {
        if (channelEffect) {
            channelEffect.style.opacity = '1';
        }

        currentChannel++;
        if (currentChannel > channelVideos.length) currentChannel = 1;

        if (channelDisplay) {
            channelDisplay.textContent = 'CH ' + currentChannel.toString().padStart(2, '0');
        }

        setTimeout(() => {
            playChannel(currentChannel);
            if (channelEffect) {
                channelEffect.style.opacity = '0';
            }
        }, 300);
    }

    // --- האזנה ללחיצות ---
    if (switchBtn) {
        switchBtn.addEventListener('click', switchBackground);
    }

    // --- שליטה באודיו ---
    if (audioPlayer) {
        // ניסיון ניגון אוטומטי
        audioPlayer.play().catch(function (error) {
            console.log('Autoplay blocked:', error);
        });

        if (playBtn) {
            playBtn.addEventListener('click', () => {
                audioPlayer.play();
            });
        }
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                audioPlayer.pause();
            });
        }
    }
});
