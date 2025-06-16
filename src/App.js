import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

function CyberBackground({ blinking }) {
  return (
    <div
      className={`absolute top-0 left-0 w-full h-full z-0 pointer-events-none 
        bg-[radial-gradient(circle,rgba(0,255,0,0.06)_1px,transparent_1px)] 
        bg-[length:20px_20px] ${blinking ? "animate-cyber-blink" : ""}`}
    />
  );
}

function App() {
  const [stage, setStage] = useState("idle");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [terminalBlinking, setTerminalBlinking] = useState(true);
  const [voices, setVoices] = useState([]);
  const startupAudioRef = useRef(null);
  const voiceAudioRef = useRef(null);
  const bgMusicRef = useRef(null);

  const jarvisResponses = {
    hello: " Hello, sir. How can I assist you?",
    time: ` The time is ${new Date().toLocaleTimeString()}.`,
    name: " I am J.A.R.V.I.S, your cybernetic assistant.",
    joke: " Why did the robot go to therapy? Because it had too many breakdowns.",
    hi: " Hi there sir how's your day today?",
  };

  const speak = (text) => {
    const synth = window.speechSynthesis;
    const voice =
      voices.find((v) => v.name.includes("Google UK English Male")) || voices[0];

    const utter = new SpeechSynthesisUtterance(text);
    if (voice) utter.voice = voice;
    utter.rate = 0.9;
    synth.speak(utter);
  };

  const getSmartReply = async (message) => {
    try {
      const res = await axios.post("/api/chat", { message });
      return res.data.reply;
    } catch (err) {
      console.error("API error:", err);
      return "Sorry, I couldn't process that request.";
    }
  };
  
  const simulateTyping = (text, callback) => {
    let index = 0;
    setOutput("");
    const interval = setInterval(() => {
      setOutput((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
        callback?.();
      }
    }, 20);
  };

  useEffect(() => {
    const synth = window.speechSynthesis;
    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      if (availableVoices.length) {
        setVoices(availableVoices);
      } else {
        setTimeout(loadVoices, 200);
      }
    };
    loadVoices();
    synth.onvoiceschanged = loadVoices;
  }, []);

  useEffect(() => {
    startupAudioRef.current = new Audio("/startup.mp3");
    voiceAudioRef.current = new Audio("/voice.mp3");
    bgMusicRef.current = new Audio("/cyber_theme.mp3");
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.4;
  
    const handleClick = async () => {
      setStage("init");
  
      setTimeout(async () => {
        setStage("matrix");
  
        try {
          const elem = document.documentElement;
          if (elem.requestFullscreen) await elem.requestFullscreen();
  
          await startupAudioRef.current.play();
  
          startupAudioRef.current.onended = () => {
            setStage("voice");
            voiceAudioRef.current.play();
  
            let progress = 0;
            const interval = setInterval(() => {
              progress += 1.42;
              setLoadingProgress(progress);
              if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                  setStage("terminal");
                  setTimeout(() => setTerminalBlinking(false), 4000);
                }, 500);
              }
            }, 100);
  
            // Move background music play to AFTER voice.mp3 ends
            voiceAudioRef.current.onended = () => {
              bgMusicRef.current.play().catch((err) =>
                console.warn("Background music play failed:", err)
              );
            };
          };
        } catch (err) {
          console.warn("Audio or fullscreen failed:", err);
          setStage("terminal");
        }
      }, 2500);
    };
  
    document.addEventListener("click", handleClick, { once: true });
    return () => document.removeEventListener("click", handleClick);
  }, []);
  

  useEffect(() => {
    const restoreFocus = () => document.querySelector("textarea")?.focus();
    window.addEventListener("click", restoreFocus);
    return () => window.removeEventListener("click", restoreFocus);
  }, []);

  useEffect(() => {
    const container = document.querySelector(".terminal-scroll");
    if (container) container.scrollTop = container.scrollHeight;
  }, [output]);

  const handleInput = (e) => setInput(e.target.value);

  const handleCommand = async () => {
    const cleaned = input.trim().toLowerCase();
    setInput("");
    setOutput("Processing...");
    const match = Object.keys(jarvisResponses).find((k) => cleaned.includes(k));
    const reply = match ? jarvisResponses[match] : await getSmartReply(cleaned);
    simulateTyping(reply, () => speak(reply));
  };

  return (
    <div className="min-h-screen w-full bg-black text-green-400 font-mono flex items-center justify-center overflow-hidden px-2">
      {stage === "idle" && (
        <div className="text-xl sm:text-2xl md:text-4xl text-green-400 animate-pulse text-center">
          Click to start
        </div>
      )}

      {stage === "init" && (
        <div className="text-xl sm:text-2xl md:text-4xl text-green-400 animate-pulse text-center">
          INITIALIZING J.A.R.V.I.S OS...
        </div>
      )}

      {stage === "matrix" && <MatrixRain />}

      {stage === "voice" && (
        <div className="flex flex-col items-center text-green-400 space-y-6 text-center">
          <h2 className="text-lg sm:text-xl md:text-2xl animate-pulse">
            Loading Voice Interface...
          </h2>
          <div className="w-64 max-w-full h-4 border border-green-500 rounded overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-100 ease-linear"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {stage === "terminal" && (
        <div className="relative w-full h-full">
        <CyberBackground blinking={terminalBlinking} />
      
        {/* 🔥 NEW: Animated gradient backdrop */}
        <div className="absolute inset-0 z-0 animate-gradient-glow bg-gradient-to-br from-[#003300] via-black to-[#001100] opacity-40 blur-3xl pointer-events-none" />
      
        <div
          className={`relative z-10 flex flex-col items-center space-y-4 w-full h-full p-4 sm:p-6 md:p-10 ${
            terminalBlinking ? "animate-fade-blink" : ""
          }`}
        >   
            <div className="border border-green-400 p-4 sm:p-6 rounded-lg bg-black bg-opacity-70 shadow-xl w-full max-w-3xl">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center space-x-2">
                <span className="text-green-500 text-2xl sm:text-3xl md:text-4xl">●</span>
                <span>J.A.R.V.I.S OS</span>
              </h1>
              <p className="mt-2 text-green-300 text-sm sm:text-base md:text-lg">
                Cybernetic interface online.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <button
                className="px-4 py-2 border border-green-400 rounded shadow-md bg-green-900 text-green-300 cursor-not-allowed"
                disabled
              >
                ✅ Terminal Active
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 border border-green-400 hover:bg-green-800 rounded shadow-md transition"
              >
                🔁 Reboot
              </button>
            </div>

            <div className="mt-8 w-full max-w-3xl h-[50vh] bg-black border border-green-400 p-4 overflow-y-auto rounded relative terminal-scroll">
              <div className="relative z-10">
                <pre className="text-green-300 text-sm mb-2">
                  [J.A.R.V.I.S]: Boot diagnostics complete...{"\n"}
                  [Interface]: Terminal active. Type a command.
                </pre>
                <div className="text-sm text-green-300 whitespace-pre-wrap">
                  <span className="text-green-500">&gt; </span>
                  {input.split("").map((ch, i) => (
                    <span key={i} className="text-red-500">{ch}</span>
                  ))}
                  <span className="animate-blink-fade">█</span>
                </div>
                {output && (
                  <div className="mt-2 text-green-300">[J.A.R.V.I.S]: {output}</div>
                )}
              </div>
              <textarea
                className="absolute inset-0 opacity-0"
                autoFocus
                value={input}
                onChange={handleInput}
                onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    await handleCommand();
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MatrixRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const columns = Math.floor(canvas.width / 20);
    const drops = new Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#0F0";
      ctx.font = "16px monospace";

      for (let i = 0; i < drops.length; i++) {
        const char = String.fromCharCode(0x30A0 + Math.random() * 96);
        ctx.fillText(char, i * 20, drops[i] * 20);

        if (drops[i] * 20 > canvas.height || Math.random() > 0.95) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />
  );
}

export default App;