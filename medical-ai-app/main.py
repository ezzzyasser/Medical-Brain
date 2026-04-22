import sqlite3
import requests
import json
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATABASE SETUP ---
DB_FILE = "medical_maintenance.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.executescript('''
    CREATE TABLE IF NOT EXISTS machines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        machine_type TEXT NOT NULL,
        model TEXT,
        serial_number TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS service_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        machine_id INTEGER NOT NULL,
        engineer_name TEXT NOT NULL,
        problem_summary TEXT,
        error_code TEXT,
        troubleshooting_steps TEXT,
        final_solution TEXT,
        original_report TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(machine_id) REFERENCES machines(id)
    );
    ''')
    conn.commit()
    conn.close()

init_db()

# --- AI CONFIGURATION ---
HF_TOKEN = ""
API_URL = "https://router.huggingface.co/v1/chat/completions"

class ReportRequest(BaseModel):
    report_text: str
    engineer_name: str

def query_ai(prompt):
    payload = {
        "model": "Qwen/Qwen2.5-7B-Instruct",
        "messages": [
            {
                "role": "system", 
                "content": (
                    "You are a medical equipment technical translator and data extractor. "
                    "INPUT: Technical reports in Arabic, English, or mixed Arabic/English. "
                    "OUTPUT: You MUST output ONLY a valid JSON object. "
                    "IMPORTANT: All values in the JSON must be translated to PROFESSIONAL TECHNICAL ENGLISH. "
                    "Fields to extract: device_name, model, serial_number, error_code, problem_description, "
                    "troubleshooting_steps (list of strings), final_solution."
                )
            },
            {"role": "user", "content": f"Translate and extract data from this report into English JSON: {prompt}"}
        ],
        "temperature": 0.1
    }
    headers = {"Authorization": f"Bearer {HF_TOKEN}", "Content-Type": "application/json"}
    
    try:
        response = requests.post(API_URL, headers=headers, json=payload)
        if response.status_code != 200:
            return None
        return response.json()['choices'][0]['message']['content']
    except Exception:
        return None

# --- API ENDPOINTS ---

@app.post("/process-report")
async def process_report(data: ReportRequest):
    ai_response = query_ai(data.report_text)
    if not ai_response:
        raise HTTPException(status_code=500, detail="AI Service Unavailable")

    # Clean JSON from AI markdown (regex handles cases where AI adds text outside the block)
    try:
        json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
        if not json_match:
            raise ValueError("No JSON found")
        
        extracted = json.loads(json_match.group(0))
    except Exception:
        raise HTTPException(status_code=422, detail="AI output was not valid JSON")

    # Save to SQLite
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        # 1. Update/Insert Machine (Using English translations from AI)
        cursor.execute("""
            INSERT OR IGNORE INTO machines (machine_type, model, serial_number) 
            VALUES (?, ?, ?)""",
            (extracted.get("device_name"), extracted.get("model"), extracted.get("serial_number"))
        )
        
        cursor.execute("SELECT id FROM machines WHERE serial_number = ?", (extracted.get("serial_number"),))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=400, detail="Could not create machine entry")
        m_id = row[0]

        # 2. Save Report
        cursor.execute("""INSERT INTO service_reports 
                       (machine_id, engineer_name, problem_summary, error_code, troubleshooting_steps, final_solution, original_report) 
                       VALUES (?, ?, ?, ?, ?, ?, ?)""", 
                       (m_id, data.engineer_name, extracted.get("problem_description"), 
                        extracted.get("error_code"), json.dumps(extracted.get("troubleshooting_steps")), 
                        extracted.get("final_solution"), data.report_text))
        
        conn.commit()
        conn.close()
        return {"status": "success", "extracted_data": extracted}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database Error: {str(e)}")

@app.get("/logs")
async def get_all_logs():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT r.*, m.machine_type, m.serial_number 
        FROM service_reports r 
        JOIN machines m ON r.machine_id = m.id 
        ORDER BY r.created_at DESC
    """)
    columns = [column[0] for column in cursor.description]
    results = [dict(zip(columns, row)) for row in cursor.fetchall()]
    conn.close()
    return results

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)