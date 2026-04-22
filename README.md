##Medical Brain: Automated Technical Log Analysis
Medical Brain is an intelligent data pipeline designed to transform unstructured medical equipment service reports into a structured, searchable knowledge base. By leveraging Natural Language Processing (NLP), this project automates the extraction of critical technical data from engineer logs, helping maintenance teams track machine history and optimize repair workflows.

### Key Features
Automated Information Extraction: Parses complex, free-text descriptions from engineers to identify specific machine faults, parts replaced, and actions taken.
Structured Storage: Converts raw text logs into a normalized SQLite database for high-performance querying and historical analysis.
Summarization Engine: Generates concise technical summaries of lengthy repair histories, allowing junior engineers to understand a machine's "medical record" at a glance.
Local-First Design: Built with a focus on data privacy, ensuring that sensitive maintenance logs are processed efficiently without mandatory reliance on external cloud APIs.

### Tech Stack
Language: Python
Data Processing: Pandas, Regex
Database: SQLite / SQLAlchemy
AI Frameworks: LangChain, CrewAI
Models: Integrated with local LLMs (via Ollama) for privacy-centric text reasoning.

### Project Structure
data_ingestion/: Scripts for loading raw machine logs (CSV/Excel/Text).
processing_pipeline/: Core logic for cleaning and extracting technical entities.
database/: Schema definitions and migration scripts for the SQLite backend.
models/: Prompt templates and local model configurations for summarization.

### How It Works
Ingest: Raw service reports are fed into the system.
Analyze: The pipeline identifies technical keywords (e.g., "Error 404," "Sensor Replacement," "Calibration").
Structure: Extracted data is mapped to specific fields: Machine_ID, Fault_Type, Resolution, and Date.
Query: Users can search the database to find patterns in equipment failure across multiple hospital sites.
