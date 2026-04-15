// import React, { useEffect, useRef } from 'react';

// export default function BackgroundWarp() {
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     let stars = [];

//     const initStars = () => {
//       canvas.width = window.innerWidth;
//       canvas.height = window.innerHeight;
//       stars = [];
//       for (let i = 0; i < 200; i++) {
//         stars.push({
//           x: Math.random() * canvas.width,
//           y: Math.random() * canvas.height,
//           z: Math.random() * canvas.width,
//         });
//       }
//     };

//     const draw = () => {
//       ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
//       ctx.fillRect(0, 0, canvas.width, canvas.height);
//       const cx = canvas.width / 2;
//       const cy = canvas.height / 2;

//       stars.forEach((star) => {
//         star.z -= 10;
//         if (star.z <= 0) {
//           star.z = canvas.width;
//           star.x = Math.random() * canvas.width;
//           star.y = Math.random() * canvas.height;
//         }
//         const k = 128.0 / star.z;
//         const px = (star.x - cx) * k + cx;
//         const py = (star.y - cy) * k + cy;

//         if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
//           const size = (1 - star.z / canvas.width) * 4;
//           const shade = Math.floor((1 - star.z / canvas.width) * 255);
//           ctx.fillStyle = `rgb(0, ${shade}, ${shade})`;
//           ctx.fillRect(px, py, size, size);
//         }
//       });
//       requestAnimationFrame(draw);
//     };

//     window.addEventListener('resize', initStars);
//     initStars();
//     draw();

//     return () => window.removeEventListener('resize', initStars);
//   }, []);

//   return <canvas ref={canvasRef} id="bgCanvas" className="fixed inset-0 z-[-1] opacity-60" />;
// }