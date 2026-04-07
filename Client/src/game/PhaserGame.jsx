import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import RoomScene from './RoomScene';

const GAME_WIDTH = 40 * 32;  // 1280px (40 tiles x 32px)
const GAME_HEIGHT = 30 * 32; // 960px (30 tiles x 32px)

export default function PhaserGame({ roomId }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      backgroundColor: '#0f0f1a',
      physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false },
      },
      scene: [new RoomScene({ roomId })],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      pixelArt: true,
      input: {
        keyboard: { target: window },
      },
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [roomId]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
