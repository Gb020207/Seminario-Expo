import { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as speechCommands from '@tensorflow-models/speech-commands';

function App() {
  const [model, setModel] = useState(null);
  const [word, setWord] = useState('ESPERANDO CONEXION...');
  const [isListening, setIsListening] = useState(false);
  
  const isCooldown = useRef(false);

  useEffect(() => {
    const loadModel = async () => {
      const recognizer = speechCommands.create('BROWSER_FFT');
      await recognizer.ensureModelLoaded();
      setModel(recognizer);
      setWord('SISTEMA EN LINEA. LISTO.');
    };

    loadModel();
  }, []);

  const startListening = async () => {
    if (!model) return;
    setIsListening(true);
    setWord('SOLICITANDO PERMISO...');

    try {
      await model.listen(result => {
        if (isCooldown.current) return;

        const words = model.wordLabels();
        const maxScoreIndex = result.scores.indexOf(Math.max(...result.scores));
        const detectedWord = words[maxScoreIndex];
        const score = result.scores[maxScoreIndex];

        if (detectedWord === '_background_noise_' || detectedWord === '_unknown_') {
          return;
        }

        if (score > 0.85) {
          setWord(`✅ COMANDO: ${detectedWord.toUpperCase()}`);
          isCooldown.current = true;
          console.log(`Éxito: ${detectedWord} con ${(score * 100).toFixed(0)}%`);

          setTimeout(() => {
            isCooldown.current = false;
            setWord('ESCUCHANDO...');
          }, 1500);
        }

      }, {
        includeSpectrogram: true,
        probabilityThreshold: 0.85, 
        overlapFactor: 0.50,
        invokeCallbackOnNoiseAndUnknown: false
      });
      
      setWord('ESCUCHANDO AUDIO...');

    } catch (error) {
      console.error("Error de micrófono", error);
      setWord('ERROR: MICROFONO DENEGADO');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (model && isListening) {
      model.stopListening();
      setIsListening(false);
      isCooldown.current = false; 
      setWord('MICRÓFONO APAGADO.');
    }
  };

  return (
    <div className="main-wrapper">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
          
          /* Reseteo forzado para el contenedor de Vite */
          html, body, #root {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background-color: #050505;
          }

          /* Contenedor flex principal para asegurar el centrado absoluto */
          .main-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            width: 100vw;
            font-family: 'Press Start 2P', monospace;
            color: #39ff14;
            background-color: #050505;
          }
          
          .retro-container {
            border: 4px solid #39ff14;
            padding: 40px;
            background: #0a0a0a;
            box-shadow: 0 0 20px #39ff14, inset 0 0 20px #39ff14;
            text-align: center;
            max-width: 800px;
            width: 90%;
            text-transform: uppercase;
          }
          
          .retro-title {
            font-size: 1rem;
            margin-bottom: 15px;
            color: #ff007f;
            text-shadow: 0 0 10px #ff007f;
            line-height: 1.5;
          }
          
          .retro-subtitle {
            font-size: 1.2rem;
            margin-bottom: 40px;
            color: #0ff;
            text-shadow: 0 0 10px #0ff;
          }
          
          .retro-screen {
            background-color: #021002;
            border: 4px solid #39ff14;
            padding: 30px 20px;
            margin: 20px 0 40px 0;
            min-height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            line-height: 1.5;
            text-shadow: 0 0 5px currentColor;
          }
          
          .retro-btn {
            background-color: transparent;
            color: #39ff14;
            border: 4px solid #39ff14;
            padding: 15px 25px;
            font-family: 'Press Start 2P', monospace;
            font-size: 0.9rem;
            cursor: pointer;
            margin: 10px;
            transition: all 0.2s ease;
          }
          
          .retro-btn:hover:not(:disabled) {
            background-color: #39ff14;
            color: #000;
            box-shadow: 0 0 15px #39ff14;
          }
          
          .retro-btn:disabled {
            border-color: #333;
            color: #333;
            cursor: not-allowed;
            text-shadow: none;
          }
          
          .retro-footer {
            margin-top: 40px;
            font-size: 0.6rem;
            color: #777;
            line-height: 2;
          }
        `}
      </style>

      <div className="retro-container">
        <div className="retro-title">MATERIA: SEMINARIO DE ACTUALIZACIÓN</div>
        <div className="retro-subtitle">MODELO: SPEECH - COMMANDS</div>

        <div 
          className="retro-screen" 
          style={{ color: word.includes('✅') ? '#fff' : '#39ff14' }}
        >
          {word}
        </div>

        <button 
          className="retro-btn" 
          onClick={startListening} 
          disabled={!model || isListening}
        >
          [ START ]
        </button>

        <button 
          className="retro-btn" 
          onClick={stopListening} 
          disabled={!isListening}
        >
          [ STOP ]
        </button>
        
        <div className="retro-footer">
          * HABLAR DE FORMA NATURAL.<br/>
          * SISTEMA ENFRIANDO 1.5S TRAS DETECCION.<br/>
          (C) 2026 TSDSM
        </div>
      </div>
    </div>
  );
}

export default App;