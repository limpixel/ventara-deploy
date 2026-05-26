'use client';

import Lottie from 'lottie-react';

import idleAnimation from '@/public/lottie/Login.json';
import errorAnimation from '@/public/lottie/Denied.json';

interface Props {
  isError: boolean;
}

export default function VentaraAnimation({
  isError,
}: Props) {
  return (
    <div className="w-145 h-145">
      <Lottie
        animationData={
          isError
            ? errorAnimation
            : idleAnimation
        }
        loop
        autoplay
      />
    </div>
  );
}