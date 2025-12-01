document.addEventListener('DOMContentLoaded', function () {
    const audioPlayer = document.getElementById('audio-player');
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const video = document.getElementById('background-video');
    const gif = document.getElementById('background-gif');
    const switchBtn = document.getElementById('toggle-background');
    const channelEffect = document.getElementById('channel-switch-effect');

    let showVideo = true;

    function switchBackground() {
        if (channelEffect) {
            // הצג את אפקט ההפרעה
            channelEffect.style.opacity = '1';

            // אחרי 300 מילישניות - החלף רקע והסתר את האפקט
            setTimeout(() => {
                showVideo = !showVideo;
                video.style.display = showVideo ? 'block' : 'none';
                gif.style.display = showVideo ? 'none' : 'block';

                channelEffect.style.opacity = '0';
            }, 300);
        } else {
            // Fallback if effect element is missing
            showVideo = !showVideo;
            video.style.display = showVideo ? 'block' : 'none';
            gif.style.display = showVideo ? 'none' : 'block';
        }
    }

    if (switchBtn) {
        switchBtn.addEventListener('click', switchBackground);
    }

    if (audioPlayer) {
        audioPlayer.play().catch(function (error) {
            console.log('Autoplay blocked:', error);
        });

        if (playBtn) playBtn.addEventListener('click', () => audioPlayer.play());
        if (pauseBtn) pauseBtn.addEventListener('click', () => audioPlayer.pause());
    }
});
