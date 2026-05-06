import { useState, useEffect } from 'react';
import sioseImg from '../assets/images/33.webp';
import bistonImg from '../assets/images/biston.webp';
import eramImg from '../assets/images/eram.jpg';
import hormozImg from '../assets/images/hormoz.jpg';
import kandowanImg from '../assets/images/kandowan.jpg';
import shahdadImg from '../assets/images/shahdad.jpg';
import shazdehImg from '../assets/images/shazdeh.jpg';
import takhtImg from '../assets/images/takht.webp';

const BACKGROUNDS = [
  sioseImg,
  bistonImg,
  eramImg,
  hormozImg,
  kandowanImg,
  shahdadImg,
  shazdehImg,
  takhtImg,
];

const ONE_HOUR = 60 * 60 * 1000;

export function useRotatingBackground() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentImage, setCurrentImage] = useState(BACKGROUNDS[0]);

  useEffect(() => {
    const savedIndex = localStorage.getItem('backgroundIndex');
    const savedTime = localStorage.getItem('backgroundChangeTime');
    const now = Date.now();

    if (savedIndex && savedTime) {
      const lastChangeTime = parseInt(savedTime, 10);
      const timeDiff = now - lastChangeTime;

      if (timeDiff >= ONE_HOUR) {
        const hoursPassed = Math.floor(timeDiff / ONE_HOUR);
        const newIndex = (parseInt(savedIndex, 10) + hoursPassed) % BACKGROUNDS.length;
        setCurrentIndex(newIndex);
        setCurrentImage(BACKGROUNDS[newIndex]);
        localStorage.setItem('backgroundIndex', newIndex.toString());
        localStorage.setItem('backgroundChangeTime', now.toString());
      } else {
        const index = parseInt(savedIndex, 10);
        setCurrentIndex(index);
        setCurrentImage(BACKGROUNDS[index]);
      }
    } else {
      localStorage.setItem('backgroundIndex', '0');
      localStorage.setItem('backgroundChangeTime', now.toString());
    }

    const interval = setInterval(() => {
      const savedIdx = parseInt(localStorage.getItem('backgroundIndex') || '0', 10);
      const newIndex = (savedIdx + 1) % BACKGROUNDS.length;
      setCurrentIndex(newIndex);
      setCurrentImage(BACKGROUNDS[newIndex]);
      localStorage.setItem('backgroundIndex', newIndex.toString());
      localStorage.setItem('backgroundChangeTime', Date.now().toString());
    }, ONE_HOUR);

    return () => clearInterval(interval);
  }, []);

  return { currentImage, currentIndex, totalImages: BACKGROUNDS.length };
}
