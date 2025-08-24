import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Home, Camera as CameraIcon } from 'lucide-react';

// MediaPipe Pose + drawing utils
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
// These utils don't ship full TS types everywhere.
// @ts-ignore
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
// @ts-ignore
import { Camera } from '@mediapipe/camera_utils';

interface WorkoutTrainerProps {
  onBackToHome: () => void;
}

interface ExerciseMetrics {
  reps: number;
  stage: string;         // 'Ready' | 'up' | 'down'
  goodReps: number;
  feedback: string[];
}

const WorkoutTrainer: React.FC<WorkoutTrainerProps> = ({ onBackToHome }) => {
  // ---------------- State ----------------
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<ExerciseMetrics>({
    reps: 0,
    stage: 'Ready',
    goodReps: 0,
    feedback: []
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
  const lastRepAtRef = useRef<number>(0); // debounce double counts

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
    { id: 'plank', name: '🧘 Plank', description: 'Full core stability' }
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

      // Register a single stable handler; it reads fresh values from refs
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
  // Small helper to avoid bouncy double counts
  const tryCount = (next: ExerciseMetrics, now: number, cooldownMs = 350) => {
    if (now - lastRepAtRef.current > cooldownMs) {
      next.reps += 1;
      next.goodReps += 1; // simple demo criterion
      lastRepAtRef.current = now;
    }
  };

  const nextBicepCurl = (landmarks: any[], prev: ExerciseMetrics): ExerciseMetrics => {
    // Support either arm: take the smaller (more bent) elbow
    const L_shoulder = land(landmarks, 11), L_elbow = land(landmarks, 13), L_wrist = land(landmarks, 15);
    const R_shoulder = land(landmarks, 12), R_elbow = land(landmarks, 14), R_wrist = land(landmarks, 16);

    const L_angle = calculateAngle(L_shoulder, L_elbow, L_wrist);
    const R_angle = calculateAngle(R_shoulder, R_elbow, R_wrist);
    const elbowAngle = Math.min(L_angle, R_angle);

    let next: ExerciseMetrics = { ...prev, feedback: [] };
    const now = performance.now();

    // thresholds
    const UP_THRESH = 40;    // fully flexed
    const DOWN_THRESH = 155; // extended

    if (elbowAngle > DOWN_THRESH) {
      next.stage = 'down';
    }

    if (elbowAngle < UP_THRESH && prev.stage === 'down') {
      next.stage = 'up';
      tryCount(next, now);
    }

    // simple feedback (only used in side panel now)
    if (next.stage === 'up' && elbowAngle > 55) next.feedback = ['Lift a bit higher'];
    else if (next.stage === 'down' && elbowAngle < 150) next.feedback = ['Lower fully'];

    return next;
  };

  const nextSquats = (landmarks: any[], prev: ExerciseMetrics): ExerciseMetrics => {
    // Use the tighter knee (either side)
    const L_hip = land(landmarks, 23), L_knee = land(landmarks, 25), L_ankle = land(landmarks, 27);
    const R_hip = land(landmarks, 24), R_knee = land(landmarks, 26), R_ankle = land(landmarks, 28);

    const L_angle = calculateAngle(L_hip, L_knee, L_ankle);
    const R_angle = calculateAngle(R_hip, R_knee, R_ankle);
    const kneeAngle = Math.min(L_angle, R_angle);

    let next: ExerciseMetrics = { ...prev, feedback: [] };
    const now = performance.now();

    const TOP_THRESH = 165;  // standing tall
    const BOTTOM_THRESH = 100; // down

    if (kneeAngle > TOP_THRESH) {
      next.stage = 'up';
    }

    if (kneeAngle < BOTTOM_THRESH && prev.stage === 'up') {
      next.stage = 'down';
      tryCount(next, now, 450);
    }

    if (next.stage === 'down' && kneeAngle > 105) next.feedback = ['Go a bit deeper'];

    return next;
  };

  const nextPushups = (landmarks: any[], prev: ExerciseMetrics): ExerciseMetrics => {
    // Use tighter elbow angle (either side)
    const L_shoulder = land(landmarks, 11), L_elbow = land(landmarks, 13), L_wrist = land(landmarks, 15);
    const R_shoulder = land(landmarks, 12), R_elbow = land(landmarks, 14), R_wrist = land(landmarks, 16);

    const L_angle = calculateAngle(L_shoulder, L_elbow, L_wrist);
    const R_angle = calculateAngle(R_shoulder, R_elbow, R_wrist);
    const elbowAngle = Math.min(L_angle, R_angle);

    let next: ExerciseMetrics = { ...prev, feedback: [] };
    const now = performance.now();

    const TOP_THRESH = 160; // arms extended
    const BOTTOM_THRESH = 90; // at bottom

    if (elbowAngle > TOP_THRESH) {
      next.stage = 'up';
    }

    if (elbowAngle < BOTTOM_THRESH && prev.stage === 'up') {
      next.stage = 'down';
      tryCount(next, now, 450);
    }

    if (next.stage === 'down' && elbowAngle > 120) next.feedback = ['Lower a bit more'];

    return next;
  };

  // ---------------- Pose Results -> compute metrics + draw ----------------
  const onPoseResults = (results: any) => {
    const landmarks = results?.poseLandmarks;

    // READ ONLY FROM REFS here to avoid stale closures
    if (isActiveRef.current && landmarks) {
      const current = metricsRef.current;
      let next: ExerciseMetrics = current;

      switch (selectedExerciseRef.current) {
        case 'bicep_curl':
          next = nextBicepCurl(landmarks, current);
          break;
        case 'squats':
          next = nextSquats(landmarks, current);
          break;
        case 'pushups':
          next = nextPushups(landmarks, current);
          break;
        default:
          // no counting for other exercises (yet)
          next = { ...current };
          break;
      }

      // Commit to ref first, then to state (state is async)
      metricsRef.current = next;
      setMetrics(next);

      drawPose(results);
    } else {
      // Not active or no landmarks yet—just draw camera + skeleton (if any)
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

    // resize canvas to video frame
    if (video.videoWidth && video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    // clear & draw video
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (video.readyState >= 2) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    // draw skeleton only (no on-canvas HUD anymore)
    if (results?.poseLandmarks) {
      drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#10B981', lineWidth: 3 });
      drawLandmarks(ctx, results.poseLandmarks, { color: '#EF4444', lineWidth: 2 });
    }
  };

  // ---------------- Camera control (MediaPipe Camera wrapper) ----------------
  const startCamera = async () => {
    try {
      // start stream for autoplay compliance
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = stream;

      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      if (!poseRef.current) return;

      // MediaPipe Camera drives frames to pose.send
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
    } catch {
      // ignore
    }
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
          isActiveRef.current = true; // keep ref in sync immediately
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
    const base: ExerciseMetrics = { reps: 0, stage: 'Ready', goodReps: 0, feedback: [] };
    setMetrics(base);
    metricsRef.current = base;

    setIsWorkoutActive(false);
    isActiveRef.current = false;
    setCountdown(null);
    setShowSummary(false);
    setStartTime(null);
    lastRepAtRef.current = 0;

    stopCamera();

    // Clear canvas
    const c = canvasRef.current;
    const ctx = c?.getContext('2d');
    if (c && ctx) ctx.clearRect(0, 0, c.width, c.height);
  };

  // Restart metrics when changing exercise
  useEffect(() => {
    const base: ExerciseMetrics = { reps: 0, stage: 'Ready', goodReps: 0, feedback: [] };
    setMetrics(base);
    metricsRef.current = base;
    lastRepAtRef.current = 0;
  }, [selectedExercise]);

  // ---------------- Summary Screen ----------------
  if (showSummary) {
    const formPercentage = metrics.reps > 0 ? (metrics.goodReps / metrics.reps) * 100 : 100;
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700/50">
            <h2 className="text-4xl font-bold text-center mb-8 text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
              🎉 Workout Complete!
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
            </div>

            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-300 mb-2">
                <span>Form Quality</span>
                <span>{metrics.goodReps} / {metrics.reps} good reps</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${formPercentage}%` }}
                />
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={resetWorkout}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Try Again
              </button>

              <button
                onClick={onBackToHome}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
              >
                <Home className="w-5 h-5" />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- Exercise Selection Screen ----------------
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
              <button
                key={exercise.id}
                onClick={() => setSelectedExercise(exercise.id)}
                className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105 text-center"
              >
                <div className="text-3xl mb-3">{exercise.name.split(' ')[0]}</div>
                <div className="font-semibold text-white mb-2">{exercise.name.substring(2)}</div>
                <div className="text-sm text-gray-400">{exercise.description}</div>
              </button>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={onBackToHome}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 mx-auto"
            >
              <Home className="w-5 h-5" />
              Back to AI Models
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentExercise = exercises.find(ex => ex.id === selectedExercise);

  // ---------------- Workout Screen ----------------
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
          {/* Video Feed */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700/50">
              <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full"
                />

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

          {/* Controls & Metrics */}
          <div className="space-y-6">
            {/* Metrics */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-4">Performance</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-300">Reps</span>
                  <span className="text-2xl font-bold text-cyan-400">{metrics.reps}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-300">Stage</span>
                  <span className="text-lg font-semibold text-purple-400">{metrics.stage}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-300">Good Form</span>
                  <span className="text-lg font-semibold text-green-400">{metrics.goodReps}</span>
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-4">Form Feedback</h3>
              <div className="space-y-2">
                {metrics.feedback.map((feedback, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg text-sm ${
                      feedback === 'Good form!'
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}
                  >
                    {feedback}
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-4">Controls</h3>

              <div className="space-y-3">
                {!isWorkoutActive && !countdown ? (
                  <button
                    onClick={startWorkout}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Start Workout
                  </button>
                ) : (
                  <button
                    onClick={endWorkout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Pause className="w-5 h-5" />
                    End Workout
                  </button>
                )}

                <button
                  onClick={resetWorkout}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </button>

                <button
                  onClick={() => setSelectedExercise(null)}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Change Exercise
                </button>
              </div>
            </div>

            <div className="bg-gray-800/40 text-gray-400 text-xs p-3 rounded-lg border border-gray-700/40">
              Tip: Make sure your whole body (at least the target joints) is visible to the camera for best tracking.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutTrainer;
