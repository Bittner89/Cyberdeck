import { useState, useEffect } from 'react';

/**
 * Dieser Hook berechnet die Rotation für das Cyberdeck basierend auf der Mausposition.
 * Er gibt einen fertigen CSS-String zurück, den wir direkt im Style-Attribut nutzen können.
 */
export function useMouseTilt() {
  // Wir speichern die aktuelle Rotation in einem "State"
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // 1. Berechne, wo die Maus im Verhältnis zur Bildschirmgröße ist (0 bis 1)
      const xPercent = e.clientX / window.innerWidth;
      const yPercent = e.clientY / window.innerHeight;

      // 2. Berechne den Rotationswinkel (von -10 bis +10 Grad)
      // Wir ziehen 0.5 ab, damit die Mitte des Bildschirms 0 Grad ist.
      const rotX = (yPercent - 0.5) * 20; 
      const rotY = (xPercent - 0.5) * -20; // Negativ, damit es der Maus entgegenkippt

      setRotation({ x: rotX, y: rotY });
    };

    // Event-Listener hinzufügen
    window.addEventListener('mousemove', handleMouseMove);

    // WICHTIG: Den Listener entfernen, wenn die Komponente gelöscht wird (Clean-up)
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []); // Leeres Array bedeutet: Nur einmal beim Start ausführen

  // Wir geben den fertigen CSS-Transform-String zurück
  return `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;
}