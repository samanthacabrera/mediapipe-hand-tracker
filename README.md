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
<summary>Notes</summary>
    
### How the video stream works

1. Request access to the webcam

- In `setupCamera()`, it prompts the user for webcam permission with a browser popup using `navigator.mediaDevices.getUserMedia()`.
- Use `{ facingMode: 'user' }` to get the front camera/selfie view.

2. Assign the webcam stream to the video element

- Once access is granted, we assign the stream directly to the video element with `videoRef.current.srcObject = stream`.

4. Wait for Metadata

- We wait for the video metadata to load by using `onloadedmetadata()`. Video metadata includes settings like dimensions, audio, etc.

5. Start the video stream

- Finally, we call `videoRef.current.play()` to display the live webcam feed.

5. Start ML model

- `setupCamera().then(loadModel)` ensures the model starts only after the camera feed is active.

---

### How hand detection works

1. Set up the TensorFlow Environment

- `tf.setBackend('webgl')` uses the GPU for faster computation, improving performance for real-time hand tracking.
- While, `await tf.ready()` ensures TensorFlow is fully initialized before any operations are performed. This step guarantees TensorFlow is ready to process data.

2. Load the Hand Model

- Use `MediaPipeHands` from `handPoseDetection.SupportedModels`. This is the model used for hand tracking, optimized for real-time applications. It works by detecting keypoints for the hands and provides information about their position and movements.
- Initialize the model with `handPoseDetection.createDetector(...)`
- `runtime: 'mediapipe'` runs the model using the MediaPipe runtime, which is a framework developed by Google for high-performance, cross-platform machine learning.
- `modelType: 'lite'` selects a lightweight version of the model designed for faster loading and reduced resource usage.
- `solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands'` points to the CDN where the model assets (scripts) are hosted for loading.

3. Process the Video Stream

- The hand tracking model continuously estimates hand positions from the webcam video feed. This detection happens in a loop using `requestAnimationFrame(detect)`.

---

### How the drawing logic works

1. Match canvas and video size

- In `detect()` Canvas dimensions are set to match the video so drawing aligns correctly using `canvas.width = videoRef.current.videoWidth;` and `canvas.height = videoRef.current.videoHeight;`.

2. Clear the canvas each frame
   - `ctx.clearRect(...)` wipes the previous frame to prevent visual artifacts.
3. Filter for fingertip keypoints

- The hand model returns 21 keypoints.
- Fingertips are at positions `[4, 8, 12, 16, 20]` which correspond to: 4 = Thumb, 8 = Index, 12 = Middle, 16 = Ring, 20 = Pinky.

4. Draw fingertip circles

- For each fingertip, a filled circle is drawn using `ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);` and `ctx.fill();`.

5. Connect fingertips with a line

- After circles are drawn, use `ctx.moveTo()` and `ctx.lineTo()` to draw a connecting line between the fingertips.

---

### How the animation loop works

1. Update tracking with every frame

- `requestAnimationFrame(detect)` calls `detect()` on each screen refresh to keep tracking smooth and responsive.
- The canvas is essentially “refreshed” each frame based on the current hand pose.

2. Loop continues as long as the webcam is active

- As long as the video feed is playing and `requestAnimationFrame()` is being called, the loop runs infinitely.

---

### Next Steps

- Could add gesture recognition using fingertip positions later
- The model outputs 3D keypoints (x, y, z) — maybe add depth-based effects?
</details>
