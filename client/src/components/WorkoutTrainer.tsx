import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Home, Camera as CameraIcon } from 'lucide-react';

// MediaPipe Pose + drawing utils
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
// @ts-ignore
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
// @ts-ignore
import { Camera } from '@mediapipe/camera_utils';

interface WorkoutTrainerProps {
  onBackToHome: () => void;
}

interface ExerciseMetrics {
  reps: number;
  stage: 'up' | 'down' | 'ready';
  goodReps: number;
  feedback: string[];
  timer?: number; // For timed exercises like plank
  isTimerRunning?: boolean;
}

const WorkoutTrainer: React.FC<WorkoutTrainerProps> = ({ onBackToHome }) => {
  // ---------------- State ----------------
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<ExerciseMetrics>({
    reps: 0,
    stage: 'ready',
    goodReps: 0,
    feedback: [],
    timer: 0,
    isTimerRunning: false,
  });
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [workoutDuration, setWorkoutDuration] = useState(0);

  // ---------------- Refs ----------------
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // live mirrors to avoid stale-closure problems inside onPoseResults
  const metricsRef = useRef<ExerciseMetrics>(metrics);
  const selectedExerciseRef = useRef<string | null>(selectedExercise);
  const isActiveRef = useRef<boolean>(isWorkoutActive);
  const lastRepAtRef = useRef<number>(0);

  useEffect(() => { metricsRef.current = metrics; }, [metrics]);
  useEffect(() => { selectedExerciseRef.current = selectedExercise; }, [selectedExercise]);
  useEffect(() => { isActiveRef.current = isWorkoutActive; }, [isWorkoutActive]);

  // ---------------- Exercise catalog ----------------
  const exercises = [
    { id: 'bicep_curl', name: '💪 Bicep Curls', description: 'Upper arm strength training' },
    { id: 'squats', name: '🏋️ Squats', description: 'Lower body power exercise' },
    { id: 'pushups', name: '🤜 Push-ups', description: 'Chest and tricep workout' },
    { id: 'lunges', name: '🦵 Lunges', description: 'Leg and glute strengthening' },
    { id: 'overhead_press', name: '🏋️ Overhead Press', description: 'Shoulder muscle building' },
    { id: 'lateral_raises', name: '👉 Lateral Raises', description: 'Shoulder isolation exercise' },
    { id: 'pullups', name: '🏋️ Pull-ups', description: 'Back and bicep strength' },
    { id: 'glute_bridges', name: '🍑 Glute Bridges', description: 'Hip and glute activation' },
    { id: 'crunches', name: '🔥 Crunches', description: 'Core strengthening' },
    { id: 'plank', name: '🧘 Plank', description: 'Full core stability (Timed)' }
  ];

  // ---------------- MediaPipe Pose init ----------------
  useEffect(() => {
    const initPose = async () => {
      const pose = new Pose({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults(onPoseResults);
      poseRef.current = pose;
    };

    initPose();

    return () => {
      stopCamera();
      poseRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------- Geometry helpers ----------------
  const calculateAngle = (a: number[], b: number[], c: number[]): number => {
    const radians =
      Math.atan2(c[1] - b[1], c[0] - b[0]) -
      Math.atan2(a[1] - b[1], a[0] - b[0]);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    return angle > 180 ? 360 - angle : angle;
  };

  const land = (pts: any[], idx: number) => [pts[idx]?.x ?? 0, pts[idx]?.y ?? 0];

  // ---------------- Exercise processors (pure, return next metrics) ----------------
  const tryCount = (next: ExerciseMetrics, now: number, cooldownMs = 350) => {
    if (now - lastRepAtRef.current > cooldownMs) {
      next.reps += 1;
      next.goodReps += 1; // simple demo criterion
      lastRepAtRef.current = now;
    }
  };

  const nextBicepCurl = (landmarks: any[], prev: ExerciseMetrics): ExerciseMetrics => {
    const L_shoulder = land(landmarks, 11), L_elbow = land(landmarks, 13), L_wrist = land(landmarks, 15);
    const R_shoulder = land(landmarks, 12), R_elbow = land(landmarks, 14), R_wrist = land(landmarks, 16);
    const L_angle = calculateAngle(L_shoulder, L_elbow, L_wrist);
    const R_angle = calculateAngle(R_shoulder, R_elbow, R_wrist);
    const elbowAngle = Math.min(L_angle, R_angle);
    let next: ExerciseMetrics = { ...prev, feedback: [] };
    const now = performance.now();
    if (elbowAngle > 160) next.stage = 'down';
    if (elbowAngle < 30 && prev.stage === 'down') {
      next.stage = 'up';
      tryCount(next, now);
    }
    return next;
  };

  const nextSquats = (landmarks: any[], prev: ExerciseMetrics): ExerciseMetrics => {
    const L_hip = land(landmarks, 23), L_knee = land(landmarks, 25), L_ankle = land(landmarks, 27);
    const R_hip = land(landmarks, 24), R_knee = land(landmarks, 26), R_ankle = land(landmarks, 28);
    const L_angle = calculateAngle(L_hip, L_knee, L_ankle);
    const R_angle = calculateAngle(R_hip, R_knee, R_ankle);
    const kneeAngle = Math.min(L_angle, R_angle);
    let next: ExerciseMetrics = { ...prev, feedback: [] };
    const now = performance.now();
    if (kneeAngle > 165) next.stage = 'up';
    if (kneeAngle < 90 && prev.stage === 'up') {
      next.stage = 'down';
      tryCount(next, now, 450);
    }
    return next;
  };

  const nextPushups = (landmarks: any[], prev: ExerciseMetrics): ExerciseMetrics => {
    const L_shoulder = land(landmarks, 11), L_elbow = land(landmarks, 13), L_wrist = land(landmarks, 15);
    const R_shoulder = land(landmarks, 12), R_elbow = land(landmarks, 14), R_wrist = land(landmarks, 16);
    const L_angle = calculateAngle(L_shoulder, L_elbow, L_wrist);
    const R_angle = calculateAngle(R_shoulder, R_elbow, R_wrist);
    const elbowAngle = Math.min(L_angle, R_angle);
    let next: ExerciseMetrics = { ...prev, feedback: [] };
    const now = performance.now();
    if (elbowAngle > 160) next.stage = 'up';
    if (elbowAngle < 90 && prev.stage === 'up') {
      next.stage = 'down';
      tryCount(next, now, 450);
    }
    return next;
  };

  const nextLunges = (landmarks: any[], prev: ExerciseMetrics): ExerciseMetrics => {
    const L_hip = land(landmarks, 23), L_knee = land(landmarks, 25), L_ankle = land(landmarks, 27);
    const R_hip = land(landmarks, 24), R_knee = land(landmarks, 26), R_ankle = land(landmarks, 28);
    const L_angle = calculateAngle(L_hip, L_knee, L_ankle);
    const R_angle = calculateAngle(R_hip, R_knee, R_ankle);
    const kneeAngle = Math.min(L_angle, R_angle);
    let next: ExerciseMetrics = { ...prev, feedback: [] };
    const now = performance.now();
    if (kneeAngle > 160) next.stage = 'up';
    if (kneeAngle < 100 && prev.stage === 'up') {
      next.stage = 'down';
      tryCount(next, now, 500);
    }
    return next;
  };

  const nextOverheadPress = (landmarks: any[], prev: ExerciseMetrics): ExerciseMetrics => {
    const L_shoulder = land(landmarks, 11), L_elbow = land(landmarks, 13), L_wrist = land(landmarks, 15);
    const R_shoulder = land(landmarks, 12), R_elbow = land(landmarks, 14), R_wrist = land(landmarks, 16);
    const L_angle = calculateAngle(L_shoulder, L_elbow, L_wrist);
    const R_angle = calculateAngle(R_shoulder, R_elbow, R_wrist);
    const elbowAngle = Math.min(L_angle, R_angle);
    let next: ExerciseMetrics = { ...prev, feedback: [] };
    const now = performance.now();
    if (elbowAngle < 90) next.stage = 'down';
    if (elbowAngle > 160 && prev.stage === 'down') {
      next.stage = 'up';
      tryCount(next, now);
    }
    return next;
  };

  const nextLateralRaises = (landmarks: any[], prev: ExerciseMetrics): ExerciseMetrics => {
    const L_hip = land(landmarks, 23), L_shoulder = land(landmarks, 11), L_elbow = land(landmarks, 13);
    const R_hip = land(landmarks, 24), R_shoulder = land(landmarks, 12), R_elbow = land(landmarks, 14);
    const L_angle = calculateAngle(L_hip, L_shoulder, L_elbow);
    const R_angle = calculateAngle(R_hip, R_shoulder, R_elbow);
    const shoulderAngle = Math.max(L_angle, R_angle);
    let next: ExerciseMetrics = { ...prev, feedback: [] };
    const now = performance.now();
    if (shoulderAngle < 30) next.stage = 'down';
    if (shoulderAngle > 80 && prev.stage === 'down') {
      next.stage = 'up';
      tryCount(next, now, 500);
    }
    return next;
  };
  
  const nextGluteBridges = (landmarks: any[], prev: ExerciseMetrics): ExerciseMetrics => {
    const L_shoulder = land(landmarks, 11), L_hip = land(landmarks, 23), L_knee = land(landmarks, 25);
    const R_shoulder = land(landmarks, 12), R_hip = land(landmarks, 24), R_knee = land(landmarks, 26);
    const L_angle = calculateAngle(L_shoulder, L_hip, L_knee);
    const R_angle = calculateAngle(R_shoulder, R_hip, R_knee);
    const hipAngle = Math.max(L_angle, R_angle);
    let next: ExerciseMetrics = { ...prev, feedback: [] };
    const now = performance.now();
    if (hipAngle < 120) next.stage = 'down';
    if (hipAngle > 160 && prev.stage === 'down') {
      next.stage = 'up';
      tryCount(next, now, 500);
    }
    return next;
  };
  
  const nextCrunches = (landmarks: any[], prev: ExerciseMetrics): ExerciseMetrics => {
    const L_shoulder = land(landmarks, 11), L_hip = land(landmarks, 23), L_knee = land(landmarks, 25);
    const R_shoulder = land(landmarks, 12), R_hip = land(landmarks, 24), R_knee = land(landmarks, 26);
    const L_angle = calculateAngle(L_shoulder, L_hip, L_knee);
    const R_angle = calculateAngle(R_shoulder, R_hip, R_knee);
    const hipAngle = Math.min(L_angle, R_angle);
    let next: ExerciseMetrics = { ...prev, feedback: [] };
    const now = performance.now();
    if (hipAngle > 130) next.stage = 'down';
    if (hipAngle < 100 && prev.stage === 'down') {
      next.stage = 'up';
      tryCount(next, now, 400);
    }
    return next;
  };

  const nextPlank = (landmarks: any[], prev: ExerciseMetrics): ExerciseMetrics => {
    const shoulder = land(landmarks, 12), hip = land(landmarks, 24), ankle = land(landmarks, 28);
    const bodyAngle = calculateAngle(shoulder, hip, ankle);
    let next = { ...prev, feedback: [] };
  
    if (bodyAngle > 160 && bodyAngle < 200) { // Allow for some tolerance around 180
      next.isTimerRunning = true;
      next.feedback.push("Good form! Hold it.");
    } else {
      next.isTimerRunning = false;
      next.feedback.push("Straighten your back!");
    }
    return next;
  };

  // --- NEW: A map to associate exercise IDs with their processing functions ---
  const exerciseProcessors: { [key: string]: (landmarks: any[], prev: ExerciseMetrics) => ExerciseMetrics } = {
    'bicep_curl': nextBicepCurl,
    'squats': nextSquats,
    'pushups': nextPushups,
    'lunges': nextLunges,
    'overhead_press': nextOverheadPress,
    'lateral_raises': nextLateralRaises,
    'glute_bridges': nextGluteBridges,
    'crunches': nextCrunches,
    'plank': nextPlank,
  };

  // ---------------- Pose Results -> compute metrics + draw ----------------
  const onPoseResults = (results: any) => {
    const landmarks = results?.poseLandmarks;

    if (isActiveRef.current && landmarks) {
      const current = metricsRef.current;
      let next: ExerciseMetrics = current;

      const exerciseProcessor = exerciseProcessors[selectedExerciseRef.current || ''];
      if (exerciseProcessor) {
        next = exerciseProcessor(landmarks, current);
      } else {
        next = { ...current };
      }

      metricsRef.current = next;
      setMetrics(next);
      drawPose(results);
    } else {
      drawPose(results);
    }
  };

  // ---------------- Drawing ----------------
  const drawPose = (results: any) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (video.videoWidth && video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (video.readyState >= 2) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    if (results?.poseLandmarks) {
      drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#10B981', lineWidth: 3 });
      drawLandmarks(ctx, results.poseLandmarks, { color: '#EF4444', lineWidth: 2 });
    }
  };

  // ---------------- Camera control ----------------
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = stream;

      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      if (!poseRef.current) return;

      cameraRef.current = new Camera(videoRef.current, {
        onFrame: async () => {
          if (poseRef.current && videoRef.current) {
            await poseRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });

      cameraRef.current.start();
    } catch (error) {
      console.error('Camera access error:', error);
    }
  };

  const stopCamera = () => {
    try {
      if (cameraRef.current && typeof cameraRef.current.stop === 'function') {
        cameraRef.current.stop();
      }
    } catch { /* ignore */ }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  // ---------------- Workout lifecycle ----------------
  const startWorkout = async () => {
    setCountdown(3);
    await startCamera();

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          setIsWorkoutActive(true);
          isActiveRef.current = true;
          setStartTime(Date.now());
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  const endWorkout = () => {
    setIsWorkoutActive(false);
    isActiveRef.current = false;
    setWorkoutDuration(startTime ? (Date.now() - startTime) / 1000 : 0);
    setShowSummary(true);
    stopCamera();
  };

  const resetWorkout = () => {
    const base: ExerciseMetrics = { reps: 0, stage: 'ready', goodReps: 0, feedback: [], timer: 0, isTimerRunning: false };
    setMetrics(base);
    metricsRef.current = base;
    setIsWorkoutActive(false);
    isActiveRef.current = false;
    setCountdown(null);
    setShowSummary(false);
    setStartTime(null);
    lastRepAtRef.current = 0;
    stopCamera();
    const c = canvasRef.current;
    const ctx = c?.getContext('2d');
    if (c && ctx) ctx.clearRect(0, 0, c.width, c.height);
  };

  // --- NEW: Timer logic for plank ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorkoutActive && selectedExercise === 'plank' && metrics.isTimerRunning) {
      interval = setInterval(() => {
        setMetrics(prev => ({ ...prev, timer: (prev.timer || 0) + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive, selectedExercise, metrics.isTimerRunning]);

  useEffect(() => {
    const base: ExerciseMetrics = { reps: 0, stage: 'ready', goodReps: 0, feedback: [], timer: 0, isTimerRunning: false };
    setMetrics(base);
    metricsRef.current = base;
    lastRepAtRef.current = 0;
  }, [selectedExercise]);

  // --- UI RENDERING (No major changes, just adapting to new metrics) ---
  if (showSummary) {
    const isTimedExercise = selectedExercise === 'plank';
    const formPercentage = metrics.reps > 0 ? (metrics.goodReps / metrics.reps) * 100 : 100;
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700/50">
            <h2 className="text-4xl font-bold text-center mb-8 text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
              🎉 Workout Complete!
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {isTimedExercise ? (
                <div className="text-center p-6 bg-gray-800/50 rounded-lg border border-gray-700 md:col-span-3">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">{metrics.timer}s</div>
                  <div className="text-gray-300">Total Time in Position</div>
                </div>
              ) : (
                <>
                  <div className="text-center p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="text-3xl font-bold text-cyan-400 mb-2">{metrics.reps}</div>
                    <div className="text-gray-300">Total Reps</div>
                  </div>
                  <div className="text-center p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="text-3xl font-bold text-green-400 mb-2">{Math.round(workoutDuration)}s</div>
                    <div className="text-gray-300">Duration</div>
                  </div>
                  <div className="text-center p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="text-3xl font-bold text-purple-400 mb-2">{formPercentage.toFixed(1)}%</div>
                    <div className="text-gray-300">Form Accuracy</div>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-4 justify-center">
              <button onClick={resetWorkout} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
                <RotateCcw className="w-5 h-5" /> Try Again
              </button>
              <button onClick={onBackToHome} className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2">
                <Home className="w-5 h-5" /> Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedExercise) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text">
              AI Workout Trainer 💪
            </h1>
            <p className="text-xl text-gray-300">Choose your exercise and let AI guide your form</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
            {exercises.map((exercise) => (
              <button key={exercise.id} onClick={() => setSelectedExercise(exercise.id)} className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105 text-center">
                <div className="text-3xl mb-3">{exercise.name.split(' ')[0]}</div>
                <div className="font-semibold text-white mb-2">{exercise.name.substring(2)}</div>
                <div className="text-sm text-gray-400">{exercise.description}</div>
              </button>
            ))}
          </div>
          <div className="text-center">
            <button onClick={onBackToHome} className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 mx-auto">
              <Home className="w-5 h-5" /> Back to AI Models
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentExercise = exercises.find(ex => ex.id === selectedExercise);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-2 text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
            {currentExercise?.name}
          </h2>
          <p className="text-gray-300">{currentExercise?.description}</p>
        </div>
        {countdown && (
          <div className="text-center mb-8">
            <div className="text-8xl font-bold text-transparent bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text">
              {countdown}
            </div>
            <div className="text-xl text-gray-300 mt-4">Get Ready!</div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700/50">
              <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
                {!isWorkoutActive && !countdown && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                    <div className="text-center">
                      <CameraIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-300 mb-4">Camera will activate when you start</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-4">Performance</h3>
              <div className="space-y-4">
                {selectedExercise === 'plank' ? (
                   <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                     <span className="text-gray-300">Time</span>
                     <span className="text-2xl font-bold text-cyan-400">{metrics.timer}s</span>
                   </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-gray-300">Reps</span>
                      <span className="text-2xl font-bold text-cyan-400">{metrics.reps}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-gray-300">Stage</span>
                      <span className="text-lg font-semibold text-purple-400">{metrics.stage}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-4">Form Feedback</h3>
              <div className="space-y-2 min-h-[50px]">
                {metrics.feedback.length > 0 ? metrics.feedback.map((fb, i) => (
                  <div key={i} className={`p-3 rounded-lg text-sm ${fb.includes('Good') ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                    {fb}
                  </div>
                )) : <div className="text-gray-400 text-sm">No feedback yet.</div>}
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-4">Controls</h3>
              <div className="space-y-3">
                {!isWorkoutActive && !countdown ? (
                  <button onClick={startWorkout} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
                    <Play className="w-5 h-5" /> Start Workout
                  </button>
                ) : (
                  <button onClick={endWorkout} className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2">
                    <Pause className="w-5 h-5" /> End Workout
                  </button>
                )}
                <button onClick={resetWorkout} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2">
                  <RotateCcw className="w-5 h-5" /> Reset
                </button>
                <button onClick={() => setSelectedExercise(null)} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2">
                  Change Exercise
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutTrain