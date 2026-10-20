# TextClassify AI — Text Classification Web Application

TextClassify AI is a web-based text classification application built using Flask, HTML, CSS, and JavaScript. It provides a simple and user-friendly interface for submitting text and viewing the classification results using a machine learning model.

The project integrates a Hugging Face pretrained DistilBERT sentiment analysis model to classify text as positive or negative.

## Features

- **Text Classification:** Analyze text using a pretrained NLP model.
- **Sentiment Analysis:** Identify positive and negative sentiment.
- **Interactive Web Interface:** Submit text and view prediction results.
- **Flask Backend:** Process requests and communicate with the machine learning model.
- **REST API:** Provides endpoints for prediction and application health checks.
- **Responsive Design:** HTML, CSS, and JavaScript provide the user interface.
- **Hugging Face Integration:** Uses a pretrained Transformer model.

## Technologies Used

| Technology | Purpose |
|---|---|
| Python | Backend programming |
| Flask | Web application framework |
| Hugging Face Transformers | NLP model integration |
| DistilBERT | Pretrained sentiment analysis |
| PyTorch | Model inference backend |
| HTML5 | Web page structure |
| CSS3 | Styling and interface design |
| JavaScript | Client-side interactions |

## Project Structure

```text
TextClassify-AI/
│
├── app.py
├── requirements.txt
├── README.md
│
├── templates/
│   └── index.html
│
└── static/
    ├── style.css
    └── script.js
```

## Machine Learning Model

This project uses the pretrained Hugging Face model:

`distilbert/distilbert-base-uncased-finetuned-sst-2-english`

The model is based on DistilBERT, a lightweight Transformer architecture designed for natural language processing.

**Supported classification labels:**
- `POSITIVE`
- `NEGATIVE`

The model is pretrained for sentiment analysis and does not require training on a custom dataset for basic sentiment predictions.

## Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd TextClassify-AI
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual GitHub repository URL.

### 2. Create a Virtual Environment

```bash
python -m venv .venv
```

### 3. Activate the Virtual Environment

**Windows PowerShell:**

```powershell
.\.venv\Scripts\Activate.ps1
```

### 4. Install Dependencies

```bash
python -m pip install -r requirements.txt
```

Ensure that `requirements.txt` includes the packages required by your implementation, such as Flask, Transformers, and PyTorch.

### 5. Run the Application

```bash
python app.py
```

Open your browser and visit:

```text
http://127.0.0.1:5000
```

The pretrained model may need to download from Hugging Face the first time the application starts. Internet access may be required unless the model is already cached locally.

## API Endpoints

### Home Page

`GET /`

Loads the TextClassify AI web interface.

### Predict Text

`POST /predict`

Accepts text and returns a classification result.

Example request body:

```json
{
  "text": "This application is very useful and easy to use."
}
```

The response format depends on the implementation of `app.py`.

### Health Check

`GET /health`

Checks the application's health and, if implemented, reports whether the machine learning model is loaded.

## How It Works

1. The user opens the web application.
2. The user enters text into the input field.
3. JavaScript sends the text to the Flask backend.
4. The backend passes the input to the pretrained NLP model.
5. The model predicts the sentiment.
6. The application displays the classification result.

## Applications

- Basic sentiment analysis
- Natural language processing demonstrations
- Text analysis learning projects
- Machine learning and web development practice
- Educational demonstrations of