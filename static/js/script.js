document.addEventListener('DOMContentLoaded', function () {

    const audioPlayer = document.getElementById('audio-player');
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const video = document.getElementById('background-video');
    const gif = document.getElementById('background-gif');
    const switchBtn = document.getElementById('toggle-background')
        || document.getElementById('switch-channel-btn');
    const channelEffect = document.getElementById('channel-switch-effect');
    const channelDisplay = document.getElementById('channel-display');

    // ערוץ 1 = moonwalk + מוזיקה, ערוצים 2–3 = סרטים + סאונד הסרט
    const channelVideos = [
        'static/videos/moonwalk.mp4',
        'static/videos/video1.mp4',
        'static/videos/video2.mp4'
    ];
    let currentChannel = 1;

    if (channelDisplay) {
        channelDisplay.textContent = 'CH ' + currentChannel.toString().padStart(2, '0');
    }

    function applyChannelSound(channelNumber) {
        if (!video) return;

        if (channelNumber === 1) {
            video.muted = true;
            if (audioPlayer) {
                audioPlayer.play().catch(function () {});
            }
        } else {
            if (audioPlayer) {
                audioPlayer.pause();
            }
            video.muted = false;
        }
    }

    function playChannel(channelNumber) {
        const src = channelVideos[channelNumber - 1];
        if (!video || !src) return;

        if (gif) gif.style.display = 'none';
        video.style.display = 'block';

        const source = video.querySelector('source');
        if (source) source.src = src;
        video.src = src;
        applyChannelSound(channelNumber);
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

        setTimeout(function () {
            playChannel(currentChannel);
            if (channelEffect) {
                channelEffect.style.opacity = '0';
            }
        }, 300);
    }

    function tryStartChannel1Music() {
        if (currentChannel === 1 && audioPlayer) {
            audioPlayer.play().catch(function () {});
        }
    }

    // ניסיון התחלה עם סאונד (דפדפנים עלולים לחסום עד אינטראקציה)
    applyChannelSound(1);
    tryStartChannel1Music();

    document.addEventListener('click', tryStartChannel1Music, { once: true });
    document.addEventListener('touchstart', tryStartChannel1Music, { once: true });
    document.addEventListener('keydown', tryStartChannel1Music, { once: true });

    if (switchBtn) {
        switchBtn.addEventListener('click', switchBackground);
    }

    if (playBtn) {
        playBtn.addEventListener('click', function () {
            if (currentChannel === 1) {
                if (audioPlayer) audioPlayer.play().catch(function () {});
            } else if (video) {
                video.muted = false;
                video.play().catch(function () {});
            }
        });
    }

    if (pauseBtn) {
        pauseBtn.addEventListener('click', function () {
            if (currentChannel === 1) {
                if (audioPlayer) audioPlayer.pause();
            } else if (video) {
                video.pause();
            }
        });
    }
});
