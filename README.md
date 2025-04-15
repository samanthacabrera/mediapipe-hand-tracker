### MediaPipe Hand Tracker

A simple web app that uses MediaPipe and TensorFlow to track hand movements in real-time using your webcam. Built with React, Vite, and Tailwind CSS.

### Installation

```bash
git clone https://github.com/samanthacabrera/mediapipe-hand-tracker
cd mediapipe-hand-tracker
npm install
npm run dev
```

The app will be available at http://localhost:5173. </br>
User must allow camera access when prompted.

<details>
<summary>Notes </summary>
  
#### How the webcam is set up
1. Ask the browser for access to the webcam
- In `setupCamera()`, we ask the browser to access the webcam using `navigator.mediaDevices.getUserMedia()`.
- Use `{ facingMode: 'user' }` to get the front camera/selfie view. 
- It prompts the user for camera permission (a browser popup).
- If permission is granted, it sends back a real-time video stream from the user's webcam.
2. Connect webcam stream to video element
- Once video metadata is loaded, we call `videoRef.current.srcObject = stream;` on the video element.
3. Wait until the video metadata has loaded
- Video metadata includes things like width, height, frame rate, etc. We wait for it using `videoRef.current.onloadedmetadata()`.
4. Actually start streaming live feed
- Lastly, call `videoRef.current.play();`. This makes the video element show the live camera.

#### How drawing logic works

1. Match canvas size to the video stream

- Before drawing, the canvas size is set to same size as the video element.

2. Clear the canvas

- We clear the previous frame with `ctx.clearRect(...)`. This avoids overlap or ghosting between frames.

3. Filter for fingertip keypoints

- The hand tracking model returns 21 keypoints per hand.
- Only the fingertip keypoints are relevant: [4, 8, 12, 16, 20], which correspond to: 4 = Thumb, 8 = Index, 12 = Middle, 16 = Ring, 20 = Pinky.

4. Draw fingertip circles

- For each fingertip keypoint, we draw a filled circle using `ctx.beginPath()` and `ctx.arc(x, y, radius, 0, 2 * Math.PI)` followed by `ctx.fill()`.

5. Connect fingertips with a line

- After drawing the circles, use `ctx.lineTo()` to connect the fingertip points in order.
- Update the color of the lines by using `ctx.strokeStyle = "white")`.

#### How the animation loop works

1. Update tracking with every frame

- Inside `detect()`, do everything needed for that frame: get the current frame's keypoints, clear the canvas, and update canvase with the new frame's keypoints.
- The canvas is essentially “refreshed” each frame based on the current hand pose.

2. Loop continues as long as the webcam is active

- As long as the video feed is playing and `requestAnimationFrame()` is being called, the loop runs infinitely.

#### Notes to Self

- Could add gesture recognition using fingertip positions later
- The model outputs 3D keypoints (x, y, z) — maybe add depth-based effects?
</details>
