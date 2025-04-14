import { useEffect, useRef } from 'react';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';


export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadModel = async () => {
      // set WebGL as the backend for TensorFlow.js
      await tf.setBackend('webgl');
      await tf.ready();
      // initialize the MediaPipe hands model
      const model = handPoseDetection.SupportedModels.MediaPipeHands;
      const detector = await handPoseDetection.createDetector(model, {
        runtime: 'mediapipe',
        modelType: 'lite',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
      });

      const detect = async () => {
        if (videoRef.current.readyState === 4) {
          const hands = await detector.estimateHands(videoRef.current);
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          hands.forEach(hand => {
            // Fingertip keypoints: [4, 8, 12, 16, 20]
            const tipIndexes = [4, 8, 12, 16, 20];
            const fingertips = hand.keypoints.filter((_, i) => tipIndexes.includes(i));

            // Draw dots on fingertips
            fingertips.forEach(point => {
              ctx.beginPath();
              ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
              ctx.fillStyle = '#BBD3DD';
              ctx.fill();
            });

            // Draw lines between fingertips
            ctx.beginPath();
            fingertips.forEach((point, i) => {
              if (i === 0) {
                ctx.moveTo(point.x, point.y);
              } else {
                ctx.lineTo(point.x, point.y);
              }
            });
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
          });
        }
        requestAnimationFrame(detect);
      };

      detect();
    };

    const setupCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;

      return new Promise((resolve) => {
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          resolve();
        };
      });
    };


    setupCamera().then(loadModel);
  }, []);

  return (
    <div className="relative w-full h-screen flex justify-center items-center bg-black">
      <video ref={videoRef} className="absolute" width="640" height="480" />
      <canvas ref={canvasRef} width="640" height="480" className="absolute" />
    </div>
  );
}
