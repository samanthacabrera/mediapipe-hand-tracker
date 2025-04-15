import { useEffect, useRef } from 'react';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

export default function App() {
  const videoRef = useRef(null); // webcam video
  const canvasRef = useRef(null); // where we draw
  const containerRef = useRef(null); // container div

  useEffect(() => {
    const loadModel = async () => {
      await tf.setBackend('webgl'); // use GPU
      await tf.ready(); // wait till TF is ready

      // load MediaPipe hands model
      const model = handPoseDetection.SupportedModels.MediaPipeHands;
      const detector = await handPoseDetection.createDetector(model, {
        runtime: 'mediapipe',
        modelType: 'lite', // smaller + faster model
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
      });

      const detect = async () => {
        // wait until video is ready
        if (videoRef.current.readyState === 4) {
          const hands = await detector.estimateHands(videoRef.current); // get hand keypoints
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');

          // match canvas size to video
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          ctx.clearRect(0, 0, canvas.width, canvas.height); // clear previous frame

          hands.forEach(hand => {
            // only get fingertip points
            const tipIndexes = [4, 8, 12, 16, 20];
            const fingertips = hand.keypoints.filter((_, i) => tipIndexes.includes(i));

            // draw dots on each fingertip
            fingertips.forEach(point => {
              ctx.beginPath();
              ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
              ctx.fillStyle = '#BBD3DD';
              ctx.fill();
            });

            // draw lines between fingertips
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

        requestAnimationFrame(detect); // repeat
      };

      detect(); // start loop
    };

    const setupCamera = async () => {
      // ask for webcam access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // front cam
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      videoRef.current.srcObject = stream;

      return new Promise((resolve) => {
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play(); // start webcam
          resolve();
        };
      });
    };

    // set up camera, then load model
    setupCamera().then(loadModel);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen flex justify-center items-center bg-black transition-colors duration-500 overflow-hidden"
    >
      <video
        ref={videoRef}
        className="absolute w-full h-full object-cover"
        playsInline
        autoPlay
        muted
      />
      <canvas
        ref={canvasRef}
        className="absolute w-full h-full"
      />
    </div>
  );
}
