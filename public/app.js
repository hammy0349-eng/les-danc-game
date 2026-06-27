const socket = io();

const mobileView = document.getElementById('mobile-view');
const desktopView = document.getElementById('desktop-view');
const joinBtn = document.getElementById('join-btn');
const roomInput = document.getElementById('room-input');
const webcamElement = document.getElementById('webcam');
const cameraContainer = document.getElementById('camera-container');

let activeRoomCode = "";

function detectDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  if (/android|iphone|ipad|ipod/i.test(userAgent)) {
    mobileView.classList.remove('hidden');
  } else {
    desktopView.classList.remove('hidden');
  }
}

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false
    });
    webcamElement.srcObject = stream;
    cameraContainer.classList.remove('hidden');
    
    // Hide the input fields once camera is active
    document.querySelector('.input-group').classList.add('hidden');
    document.querySelector('p').classList.add('hidden');
    
  } catch (err) {
    alert("Camera access is required! Check browser permissions. " + err.message);
  }
}

joinBtn.addEventListener('click', () => {
  const code = roomInput.value.trim();
  if (code.length === 4) {
    activeRoomCode = code;
    socket.emit('join_room', code);
    joinBtn.textContent = "Connecting...";
  } else {
    alert("Please enter a valid 4-digit code.");
  }
});

socket.on('game_ready', () => {
  startCamera();
});

socket.on('error_message', (msg) => {
  alert(msg);
  joinBtn.textContent = "Connect";
});

// Initialize device check
detectDevice();
