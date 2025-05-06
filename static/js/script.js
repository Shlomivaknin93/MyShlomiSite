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

