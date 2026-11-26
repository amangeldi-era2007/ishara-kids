'use client';

import { Camera, CameraOff } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { HandLandmarker, HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { useWords } from './app-shell';
import { t } from '@/lib/content';
import styles from './hand-camera.module.css';

type Point = { x: number; y: number; z: number };
type Hand = { points: Point[]; handedness: string };
// Points use world coordinates in meters. `close` requests a closer hand.
export type HandCameraFrame = { hands: Hand[]; count: number; tooFar: boolean };

type CameraStatus = 'idle' | 'permission' | 'loading' | 'active';
type CameraError = 'unsupported' | 'denied' | 'missing' | 'camera' | 'model';
type CameraState = CameraStatus | CameraError;
type Delegate = 'GPU' | 'CPU';
type TrackingStatus = { delegate: Delegate; count: number; tooFar: boolean };
type Session = {
  video: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  stream?: MediaStream;
  landmarker?: HandLandmarker;
  animationFrame?: number;
};

const assetRoot = `${process.env.NEXT_PUBLIC_CONTENT_BASE || ''}/ai`;
const frameInterval = 1000 / 12;
const messages = {
  idle: t('Камера выключена.', 'Камера өшірулі.'),
  permission: t('Разреши доступ к камере в браузере.', 'Браузерде камераға рұқсат бер.'),
  loading: t('Готовим поиск рук…', 'Қолды анықтауға дайындалып жатырмыз…'),
  active: t('Камера включена.', 'Камера қосулы.'),
  unsupported: t('Камера недоступна в этом браузере. Попробуй другой браузер или устройство.', 'Бұл браузерде камера қолжетімсіз. Басқа браузерді немесе құрылғыны қолданып көр.'),
  denied: t('Нет доступа к камере. Проверь разрешение в браузере и попробуй снова.', 'Камераға рұқсат жоқ. Браузердегі рұқсатты тексеріп, қайта көр.'),
  missing: t('Камера не найдена. Подключи её и попробуй снова.', 'Камера табылмады. Оны қосып, қайта көр.'),
  camera: t('Камера недоступна. Если она открыта в другой программе, закрой её и попробуй снова.', 'Камера қолжетімсіз. Ол басқа бағдарламада ашық болса, бағдарламаны жауып, қайта көр.'),
  model: t('Не получилось включить поиск рук. Попробуй ещё раз.', 'Қолды анықтау қосылмады. Қайта көр.'),
};

function getCameraError(error: unknown): CameraError {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'SecurityError') return 'denied';
    if (error.name === 'NotFoundError') return 'missing';
  }
  return 'camera';
}

function handIsTooFar(points: Point[]) {
  const xs = points.map(({ x }) => x);
  const ys = points.map(({ y }) => y);
  // Use image coordinates for apparent size, since world coordinates use meters.
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  return span < 0.13;
}

function drawHands(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  landmarks: Point[][],
  connections: ReadonlyArray<{ start: number; end: number }>,
) {
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return;

  context.clearRect(0, 0, width, height);
  const radius = Math.max(width, height) / 145;
  context.lineCap = 'round';
  context.lineWidth = radius;
  context.strokeStyle = '#b6ead5';
  context.fillStyle = '#ffdb76';

  for (const points of landmarks) {
    context.beginPath();
    for (const { start, end } of connections) {
      const from = points[start];
      const to = points[end];
      if (!from || !to) continue;
      context.moveTo(from.x * width, from.y * height);
      context.lineTo(to.x * width, to.y * height);
    }
    context.stroke();

    for (const { x, y } of points) {
      context.beginPath();
      context.arc(x * width, y * height, radius, 0, 2 * Math.PI);
      context.fill();
    }
  }
}

function closeLandmarker(landmarker?: HandLandmarker) {
  try {
    landmarker?.close();
  } catch {
    // A failed graph can also throw on close; the camera has its own cleanup.
  }
}

export function HandCamera({
  onFrame,
  onReset,
  showDelegate = false,
}: {
  onFrame?: (frame: HandCameraFrame) => void;
  onReset?: () => void;
  showDelegate?: boolean;
}) {
  const w = useWords();
  const [state, setState] = useState<CameraState>('idle');
  const [tracking, setTracking] = useState<TrackingStatus | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const current = useRef<Session | null>(null);
  const callbacks = useRef({ onFrame, onReset });

  useEffect(() => {
    callbacks.current = { onFrame, onReset };
  }, [onFrame, onReset]);

  const dispose = useCallback(() => {
    const session = current.current;
    if (!session) return false;
    current.current = null;

    if (session.animationFrame !== undefined) cancelAnimationFrame(session.animationFrame);
    for (const track of session.stream?.getTracks() ?? []) {
      track.onended = null;
      track.stop();
    }
    session.video.pause();
    session.video.srcObject = null;
    session.canvas.getContext('2d')?.clearRect(0, 0, session.canvas.width, session.canvas.height);
    closeLandmarker(session.landmarker);
    return true;
  }, []);

  const stop = useCallback(() => {
    if (!dispose()) return;
    setState('idle');
    setTracking(null);
    callbacks.current.onReset?.();
  }, [dispose]);

  useEffect(() => {
    function stopWhenHidden() {
      if (document.hidden) stop();
    }

    document.addEventListener('visibilitychange', stopWhenHidden);
    window.addEventListener('pagehide', stop);
    return () => {
      document.removeEventListener('visibilitychange', stopWhenHidden);
      window.removeEventListener('pagehide', stop);
      dispose();
    };
  }, [dispose, stop]);

  function fail(session: Session, error: CameraError) {
    if (current.current !== session) return;
    dispose();
    setState(error);
    setTracking(null);
    callbacks.current.onReset?.();
  }

  async function start() {
    if (current.current) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('unsupported');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const session: Session = { video, canvas };
    current.current = session;
    setState('permission');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'user' }, width: { ideal: 640 }, height: { ideal: 480 } },
      });
      if (current.current !== session) {
        for (const track of stream.getTracks()) track.stop();
        return;
      }

      session.stream = stream;
      for (const track of stream.getVideoTracks()) {
        track.onended = () => fail(session, 'camera');
      }
      video.srcObject = stream;
      setState('loading');
      await video.play();
    } catch (error) {
      fail(session, getCameraError(error));
      return;
    }
    if (current.current !== session) return;

    try {
      const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision');
      if (current.current !== session) return;
      const files = await FilesetResolver.forVisionTasks(`${assetRoot}/wasm`);

      async function startTracking(delegate: Delegate) {
        if (current.current !== session) return;
        const { video, canvas } = session;
        let landmarker: HandLandmarker;
        try {
          landmarker = await HandLandmarker.createFromOptions(files, {
            baseOptions: { modelAssetPath: `${assetRoot}/hand_landmarker.task`, delegate },
            runningMode: 'VIDEO',
            numHands: 2,
          });
        } catch {
          if (delegate === 'GPU') await startTracking('CPU');
          else fail(session, 'model');
          return;
        }
        if (current.current !== session) {
          closeLandmarker(landmarker);
          return;
        }

        session.landmarker = landmarker;
        let lastFrame = -Infinity;
        let lastVideoTime = -1;

        function processFrame(now: number) {
          if (current.current !== session) return;
          session.animationFrame = requestAnimationFrame(processFrame);
          if (
            now - lastFrame < frameInterval ||
            video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
            video.currentTime === lastVideoTime
          ) return;

          const firstFrame = lastVideoTime < 0;
          lastFrame = now;
          lastVideoTime = video.currentTime;
          let result: HandLandmarkerResult;
          try {
            result = landmarker.detectForVideo(video, now);
          } catch {
            if (delegate === 'CPU') {
              fail(session, 'model');
            } else {
              cancelAnimationFrame(session.animationFrame);
              session.landmarker = undefined;
              closeLandmarker(landmarker);
              setState('loading');
              setTracking(null);
              callbacks.current.onReset?.();
              canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
              void startTracking('CPU');
            }
            return;
          }

          if (firstFrame) setState('active');
          const hands = result.worldLandmarks.map((points, index) => ({
            points: points.map(({ x, y, z }) => ({ x, y, z })),
            handedness: result.handedness[index]?.[0]?.categoryName ?? '',
          }));
          const count = hands.length;
          const tooFar = result.landmarks.some(handIsTooFar);
          setTracking((previous) => previous?.delegate === delegate &&
            previous.count === count && previous.tooFar === tooFar
            ? previous
            : { delegate, count, tooFar });
          drawHands(canvas, video, result.landmarks, HandLandmarker.HAND_CONNECTIONS);
          callbacks.current.onFrame?.({
            hands,
            count,
             tooFar,
          });
        }

        session.animationFrame = requestAnimationFrame(processFrame);
      }

      await startTracking('GPU');
    } catch {
      fail(session, 'model');
    }
  }

  const canStop = state === 'permission' || state === 'loading' || state === 'active';
  const isError = !canStop && state !== 'idle';

  return (
    <div className={styles.camera}>
      <div className={styles.preview}>
        <video ref={videoRef} className={styles.layer} muted playsInline aria-hidden="true" />
        <canvas ref={canvasRef} className={styles.layer} aria-hidden="true" />
        {state !== 'active' && (
          <div className={styles.placeholder} aria-hidden="true">
            <CameraOff size={42} />
          </div>
        )}
      </div>
      <p className={styles.status} role="status">
        {w(messages[state])}
        {state === 'active' && tracking && (
          <>
            {' '}{w(t('Руки в кадре:', 'Кадрдағы қолдар:'))} {tracking.count}
            {tracking.count === 0 && (
              <span className={styles.hint}>{w(t('Рук пока не видно. Покажи руку в камеру.', 'Қол әлі көрінбейді. Қолыңды камераға көрсет.'))}</span>
            )}
            {tracking.tooFar && (
              <span className={styles.hint}>{w(t('Поднеси руку ближе.', 'Қолыңды жақындат.'))}</span>
            )}
          </>
        )}
      </p>
      {showDelegate && state === 'active' && tracking && (
        <p className={styles.privacy}>{w(t('Обработка:', 'Өңдеу:'))} {tracking.delegate}</p>
      )}
      <p className={styles.privacy}>
        {w(t('Видео остаётся на этом устройстве. Камеру можно выключить в любой момент.', 'Бейне осы құрылғыда қалады. Камераны кез келген уақытта өшіре аласың.'))}
      </p>
      <button
        className={`btn ${canStop ? 'btn-light' : 'btn-primary'}`}
        type="button"
        onClick={canStop ? stop : start}
      >
        {canStop ? <CameraOff size={20} aria-hidden="true" /> : <Camera size={20} aria-hidden="true" />}
        {canStop
          ? w(t('Выключить камеру', 'Камераны өшіру'))
          : isError ? w(t('Попробовать снова', 'Қайта көру'))
            : w(t('Включить камеру', 'Камераны қосу'))}
      </button>
    </div>
  );
}
