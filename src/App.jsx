import { useEffect, useRef } from 'react'; // React hooks
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection'; // Hand detection model
import * as tf from '@tensorflow/tfjs-core'; // TensorFlow core
import '@tensorflow/tfjs-backend-webgl'; // WebGL backend for GPU (Graphics Processing Unit)
import HandEffects from './HandEffects';

export default function App() {
  const videoRef = useRef(null); // Ref to webcam video element
  const canvasRef = useRef(null); // Ref to canvas for drawing

  useEffect(() => {
    // Load TensorFlow backend and hand detection model
    const loadModel = async () => {
      await tf.setBackend('webgl'); // Use GPU for faster computation
      await tf.ready(); // Ensure TensorFlow is initialized

      const model = handPoseDetection.SupportedModels.MediaPipeHands; // Choose hand model
      const detector = await handPoseDetection.createDetector(model, {
        runtime: 'mediapipe', // Use MediaPipe runtime
        modelType: 'lite', // Lightweight version of the model
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands', // Load model scripts
      });

      // Detect hands and draw keypoints in a loop
      const detect = async () => {
        if (videoRef.current.readyState === 4) { // Ensure video is ready
          const hands = await detector.estimateHands(videoRef.current); // Detect hands

          const canvas = canvasRef.current; // Get canvas element
          const ctx = canvas.getContext('2d'); // Get drawing context

          canvas.width = videoRef.current.videoWidth; // Match video width
          canvas.height = videoRef.current.videoHeight; // Match video height
          ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous frame

          hands.forEach(hand => {
            const tipIndexes = [4, 8, 12, 16, 20]; // Indexes for fingertips
            const fingertips = hand.keypoints.filter((_, i) => tipIndexes.includes(i)); // Extract fingertips

            // Draw circles at each fingertip
            fingertips.forEach(point => {
              ctx.beginPath();
              ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI); 
              ctx.fillStyle = '#BBD3DD';
              ctx.fill();
            });

            // Draw lines connecting fingertips
            ctx.beginPath();
            fingertips.forEach((point, i) => {
              i === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y);
            });
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
          });
        }

        requestAnimationFrame(detect); // Loop the detection
      };

      detect(); // Start detection loop
    };

    // Set up the user's webcam
    const setupCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // Use front camera
          width: { ideal: 1280 }, // Ideal video width
          height: { ideal: 720 }, // Ideal video height
        },
        audio: false, // No audio needed
      });

      videoRef.current.srcObject = stream; // Assign stream to video element

      // Wait until video metadata is loaded
      return new Promise(resolve => {
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play(); // Start video
          resolve();
        };
      });
    };

    setupCamera().then(loadModel); // Start after camera is ready
  }, []); // Run once on mount

  return (
    // Fullscreen container
    <div className="relative w-full h-screen flex justify-center items-center bg-black transition-colors duration-500 overflow-hidden">
      <video
        ref={videoRef}
        className="absolute w-full h-full object-cover"
        playsInline // Needed for mobile
        autoPlay // Start playing immediately
        muted // No sound
      />
      <canvas
        ref={canvasRef}
        className="absolute w-full h-full"
      />
      <HandEffects videoRef={videoRef} canvasRef={canvasRef} />
    </div>
  );
}
