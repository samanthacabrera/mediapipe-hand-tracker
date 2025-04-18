import { useEffect, useState, useRef } from 'react';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

export default function HandEffects({ videoRef, canvasRef }) {
  const [color, setColor] = useState('#FADADD'); 
  const prevFingerDistance = useRef(null);

  useEffect(() => {
    const loadModel = async () => {
      await tf.setBackend('webgl');
      await tf.ready();

      const model = handPoseDetection.SupportedModels.MediaPipeHands;
      const detector = await handPoseDetection.createDetector(model, {
        runtime: 'mediapipe',
        modelType: 'lite',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
      });

      const pastelColors = [
        '#FADADD', // pink
        '#B0E0E6', // blue
        '#C1E1C1', // green
        '#FFFACD', // yellow
        '#FFB6B9', // red
        '#FFDAC1', // peach
        '#E0BBE4', // purple
        '#D5F4E6', // mint
      ];

      const randomPastel = () => {
        return pastelColors[Math.floor(Math.random() * pastelColors.length)];
      };

      let lastChangeTime = 0;

      const detect = async () => {
        if (videoRef.current && videoRef.current.readyState === 4) {
          const hands = await detector.estimateHands(videoRef.current);
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');

          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          hands.forEach(hand => {
            const tipIndexes = [4, 8, 12, 16, 20];
            const fingertips = hand.keypoints.filter((_, i) => tipIndexes.includes(i));

            if (fingertips.length === 5) {
              const thumb = fingertips[0];
              const pinky = fingertips[4];
              const distance = Math.hypot(thumb.x - pinky.x, thumb.y - pinky.y);

              if (prevFingerDistance.current !== null) {
                const diff = Math.abs(distance - prevFingerDistance.current);

                const now = Date.now();
                if (diff > 40 && now - lastChangeTime > 300) { 
                  // Only change color if enough time passed (300ms)
                  setColor(randomPastel());
                  lastChangeTime = now;
                }
              }
              prevFingerDistance.current = distance;
            }

            // Draw the colored dots
            fingertips.forEach(point => {
              ctx.beginPath();
              ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
              ctx.fillStyle = color;
              ctx.fill();
            });

            // Draw white lines connecting fingertips
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

    loadModel();
  }, [videoRef, canvasRef, color]);

  return null;
}
