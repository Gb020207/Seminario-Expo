from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
import numpy as np
import torch
from typing import List

app = FastAPI(title="Speech Commands API - Seguro")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Definimos la estructura del JSON que va a mandar el Navegador
class AudioPayload(BaseModel):
    samples: List[float]

print("Cargando modelo de Speech Commands (Wav2Vec2)...")
device = 0 if torch.cuda.is_available() else -1
classifier = pipeline(
    "audio-classification", 
    model="superb/wav2vec2-base-superb-ks", 
    device=device
)
print("¡Modelo cargado de forma exitosa y listo para la expo!")

@app.post("/predict_json")
async def predict_json(payload: AudioPayload):
    try:
        # 1. Convertir la lista de números recibida a una matriz de Numpy (float32)
        speech_array = np.array(payload.samples, dtype=np.float32)
        
        if len(speech_array) == 0:
            raise HTTPException(status_code=400, detail="El array de audio llegó vacío.")
            
        print(f"[INFO] Procesando matriz recibida de {len(speech_array)} muestras numéricas.")

        # 2. Inyectar el vector directamente al Pipeline del modelo
        predictions = classifier(speech_array)
        best_prediction = predictions[0]
        
        print(f"[ÉXITO] Comando detectado: {best_prediction['label']} ({round(best_prediction['score'] * 100, 2)}%)")
        
        return {
            "success": True,
            "command": best_prediction["label"],
            "confidence": round(best_prediction["score"] * 100, 2),
            "all_predictions": [
                {"label": p["label"], "confidence": round(p["score"] * 100, 2)} 
                for p in predictions[:3]
            ]
        }
        
    except Exception as e:
        print(f"[ERROR EN EL BACKEND]: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Falla en la inferencia del array: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)