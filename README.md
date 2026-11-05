# 📊 Automated Sales Analytics & AI Business Insights

> Automated data pipeline and interactive dashboard that ingests marketplace sales data via APIs, performs ETL in Python, and provides strategic business suggestions using LLMs (Google Gemini API).

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![APIs](https://img.shields.io/badge/REST_API-0055E6?style=for-the-badge&logo=json&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)

---

## 🎯 Business Problem & Context
Small local businesses in Duque de Caxias (RJ, Brazil) face challenges in organizing and analyzing their daily sales data to make informed commercial decisions[cite: 1, 2]. Manual tracking limits their ability to identify growth opportunities, revenue trends, and optimal promotion strategies[cite: 1].

## 💡 Solution Architecture
1. **Data Ingestion:** Automated data collection from sales channels using REST APIs[cite: 1, 2].
2. **ETL & Transformation:** Python pipeline for data cleaning, aggregation, and profit margin calculation[cite: 1, 2].
3. **Interactive Dashboard:** Deployed on Vercel to showcase real-time KPIs and interactive visual analytics[cite: 1, 2].
4. **AI Strategic Advisory:** Integrated Gemini API prompt harness that analyzes top/bottom selling items and outputs actionable promotional advice for non-technical store managers[cite: 2].

---

## 🚀 Live Demo & Key Features
- 🌐 **Live Dashboard:** [Link to your Vercel Deploy][cite: 1]
- 📈 **Key Metrics:** Monthly revenue, top-performing product categories, and profit distribution.
- 🤖 **AI Business Advisor:** Generates automatic promotion ideas based on store inventory movement[cite: 2].

---

## 🛠️ How to Run Locally

```bash
# Clone the repository
git clone [https://github.com/seu-usuario/vendas-analytics-ai.git](https://github.com/seu-usuario/vendas-analytics-ai.git)

# Navigate into directory
cd vendas-analytics-ai

# Install dependencies
pip install -r requirements.txt

# Set up environment variables (.env)
GEMINI_API_KEY=your_api_key_here

# Run script
python src/main.py
