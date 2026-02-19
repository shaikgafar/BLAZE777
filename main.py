import os
import json
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from PIL import Image
import io
from dotenv import load_dotenv
from pathlib import Path
from typing import Dict, Any, List

ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=False)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# System Instruction to ensure structured JSON output
SYSTEM_PROMPT = """
You are a Senior Construction Estimator and Financial Risk Auditor.
Analyze the blueprint image and project type.
Use quantity take-offs from visible blueprint context and industry-reasonable assumptions.
Prioritize protection against budget overrun risk, material volatility, and labor uncertainty.
Assume the user is a property owner in India.
All monetary values must be in Indian Rupees (INR) as plain numbers (no currency symbols).
Include all major materials relevant to the blueprint in take_offs.
Return ONLY a JSON object with this structure:
{
  "project_summary": "string",
  "total_estimated_cost": number,
  "confidence_score": number (0-100),
  "take_offs": [{"item": "string", "quantity": "string", "unit_cost": number, "total": number}],
  "risk_drivers": [{"factor": "string", "severity": "High|Medium|Low", "impact": "string"}],
  "market_hedge_strategy": "string"
}
"""


def build_fallback_estimate(project_type: str) -> Dict[str, Any]:
    base_items: List[Dict[str, Any]] = [
        {"item": "Cement", "quantity": "1200 bags", "unit_cost": 420, "total": 504000},
        {"item": "TMT Steel", "quantity": "18 tons", "unit_cost": 64000, "total": 1152000},
        {"item": "Sand", "quantity": "320 m3", "unit_cost": 1700, "total": 544000},
        {"item": "Aggregate", "quantity": "260 m3", "unit_cost": 1500, "total": 390000},
        {"item": "Bricks/Blocks", "quantity": "95000 units", "unit_cost": 11, "total": 1045000},
        {"item": "Labor", "quantity": "5400 man-hours", "unit_cost": 420, "total": 2268000},
    ]

    project_multipliers = {
        "Residential Tower": 0.9,
        "Commercial Complex": 1.0,
        "Industrial Facility": 1.2,
        "Hospital Infrastructure": 1.35,
    }

    multiplier = project_multipliers.get(project_type, 1.0)
    take_offs = []
    for item in base_items:
        adjusted_unit = round(item["unit_cost"] * multiplier)
        adjusted_total = round(item["total"] * multiplier)
        take_offs.append(
            {
                "item": item["item"],
                "quantity": item["quantity"],
                "unit_cost": adjusted_unit,
                "total": adjusted_total,
            }
        )

    total_estimated_cost = sum(i["total"] for i in take_offs)

    return {
        "project_summary": (
            f"Estimated INR budget for {project_type}. "
            "Live Gemini response is temporarily unavailable due to quota limits, so this is a fallback estimate."
        ),
        "total_estimated_cost": total_estimated_cost,
        "confidence_score": 62,
        "take_offs": take_offs,
        "risk_drivers": [
            {
                "factor": "Steel price volatility",
                "severity": "High",
                "impact": "Reinforcement cost may increase significantly if commodity rates rise.",
            },
            {
                "factor": "Labor availability",
                "severity": "Medium",
                "impact": "Skilled labor shortages can delay schedule and increase labor rates.",
            },
            {
                "factor": "Cement and fuel inflation",
                "severity": "Medium",
                "impact": "Transport and material input inflation may shift monthly procurement costs.",
            },
        ],
        "market_hedge_strategy": (
            "Use phased procurement with rate contracts for steel/cement, maintain a 7-10% contingency, "
            "and review supplier quotes every two weeks."
        ),
    }

@app.post("/analyze")
async def analyze_blueprint(blueprint: UploadFile = File(...), project_type: str = Form(...)):
    try:
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        gemini_model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

        if gemini_api_key:
            genai.configure(api_key=gemini_api_key)

        if not gemini_api_key:
            raise HTTPException(
                status_code=500,
                detail="Missing GEMINI_API_KEY. Create backend/.env from backend/.env.example and add your real key.",
            )

        if not blueprint.content_type or not blueprint.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type. Please upload an image (PNG/JPG/WebP).",
            )

        image_data = await blueprint.read()
        image = Image.open(io.BytesIO(image_data))
        
        prompt = (
            f"Analyze this {project_type} blueprint for a property-owner-focused cost estimate in India. "
            "Return realistic INR take-offs for all major materials, high-risk drivers, and a practical hedge strategy."
        )

        model_candidates = [
            gemini_model,
            "gemini-1.5-flash",
            "gemini-2.0-flash",
            "gemini-1.5-pro",
        ]
        unique_candidates = []
        for candidate in model_candidates:
            if candidate and candidate not in unique_candidates:
                unique_candidates.append(candidate)

        response = None
        last_model_error = None

        for model_name in unique_candidates:
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(
                    [SYSTEM_PROMPT, prompt, image],
                    generation_config={"response_mime_type": "application/json"}
                )
                break
            except Exception as model_error:
                last_model_error = model_error
                error_text = str(model_error).lower()
                if "not found" in error_text or "not supported" in error_text:
                    continue
                raise

        if response is None:
            raise HTTPException(
                status_code=500,
                detail=f"No compatible Gemini model available. Last error: {last_model_error}",
            )

        raw_text = (response.text or "").strip()

        try:
            parsed = json.loads(raw_text)
        except json.JSONDecodeError:
            start = raw_text.find("{")
            end = raw_text.rfind("}")
            if start != -1 and end != -1 and end > start:
                parsed = json.loads(raw_text[start : end + 1])
            else:
                raise HTTPException(
                    status_code=502,
                    detail="Model did not return valid JSON.",
                )

        return parsed
    except HTTPException:
        raise
    except Exception as e:
        error_text = str(e).lower()
        if "quota" in error_text or "429" in error_text or "rate limit" in error_text:
            return build_fallback_estimate(project_type)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)