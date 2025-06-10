const video = document.getElementById('background-video');
const gif = document.getElementById('background-gif');
const toggleButton = document.getElementById('toggle-background');

let isVideoActive = true;

toggleButton.addEventListener('click', function() {
    if (isVideoActive) {
        video.style.display = 'none'; // מסתיר את הוידאו
        gif.style.display = 'block'; // מציג את ה-GIF
    } else {
        video.style.display = 'block'; // מציג את הוידאו
        gif.style.display = 'none'; // מסתיר את ה-GIF
    }
    isVideoActive = !isVideoActive; // משנה את המצב
});


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
        // הצג את אפקט ההפרעה
        channelEffect.style.opacity = '1';

        // אחרי 300 מילישניות - החלף רקע והסתר את האפקט
        setTimeout(() => {
            showVideo = !showVideo;
            video.style.display = showVideo ? 'block' : 'none';
            gif.style.display = showVideo ? 'none' : 'block';

            channelEffect.style.opacity = '0';
        }, 300);
    }

    switchBtn.addEventListener('click', switchBackground);

    audioPlayer.play().catch(function (error) {
        console.log('Autoplay blocked:', error);
    });

    playBtn.addEventListener('click', () => audioPlayer.play());
    pauseBtn.addEventListener('click', () => audioPlayer.pause());
});


