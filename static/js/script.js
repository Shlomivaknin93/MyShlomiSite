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

    // --- משתנים למצב ---
    let showVideo = true;
    let currentChannel = 3; // מתחילים מערוץ 3

    // הגדרה ראשונית: מוודא שהמסך מציג CH 03 ישר בהתחלה
    if (channelDisplay) {
        channelDisplay.textContent = 'CH ' + currentChannel.toString().padStart(2, '0');
    }

    // --- פונקציית החלפת הערוץ ---
    function switchBackground() {
        
        // 1. הצג את אפקט ההפרעה (שלג)
        if (channelEffect) {
            channelEffect.style.opacity = '1';
        }

        // 2. אחרי 300 מילישניות - בצע את ההחלפה
        setTimeout(() => {
            
            // א. החלף בין וידאו ל-GIF
            showVideo = !showVideo;
            if (video) video.style.display = showVideo ? 'block' : 'none';
            if (gif) gif.style.display = showVideo ? 'none' : 'block';

            // ב. חשב את הערוץ הבא
            currentChannel++;
            if (currentChannel > 99) currentChannel = 1; // אם הגענו ל-99 נחזור ל-1

            // ג. עדכן את הטקסט במסך (לדוגמה: CH 04)
            if (channelDisplay) {
                // padStart(2, '0') דואג שיהיה תמיד 0 לפני מספר יחיד
                const formattedNumber = currentChannel.toString().padStart(2, '0');
                channelDisplay.textContent = `CH ${formattedNumber}`;
            }

            // ד. הסתר את אפקט ההפרעה
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
