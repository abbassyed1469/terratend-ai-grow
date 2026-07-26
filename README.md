# 🌱 TerraTend: AI-Powered Agriculture Dashboard



## 📖 1. Project Name
**TerraTend** — Live weather, daily watering guidance, and an AI advisor built to help you grow more with less water.

## ⚠️ 2. Problem Statement
Small-scale agriculture is highly vulnerable to unpredictable weather patterns and water scarcity. Many farmers rely on guesswork or generic schedules for irrigation and crop management, leading to wasted water resources and suboptimal yields. There is a critical lack of accessible, localized, and intelligent tools designed specifically for the everyday farmer.

## 💡 3. Solution
TerraTend is a production-ready, AI-driven web application that empowers farmers to make intelligent, data-backed decisions. By integrating keyless, real-time weather forecasting with a powerful generative AI engine via a secure gateway, TerraTend translates complex environmental data into simple, actionable daily watering schedules and localized crop management strategies. 

## ✨ 4. Features
* **Keyless Weather Architecture:** Real-time localized weather fetching using Open-Meteo (no API keys required, dynamic place-name resolution).
* **Advanced UI/UX:** A warm, earthy design system featuring soft gradient halos, subtle shadows, a pulsing live data badge, and beautifully animated custom SVGs (spinning sun rays, floating clouds, falling raindrops) replacing standard static icons.
* **Smart Irrigation Logic:** Algorithmic calculation that determines whether to "Water Today", "Delay Watering", or if "No Water is Needed" based on live atmospheric data and humidity levels.
* **7-Day Watering Outlook:** A predictive weekly schedule cross-referencing forecasted rain probability with watering needs, beautifully rendered with animated weather states.
* **Robust Error Handling:** Features a clean "location not found" state and dynamic fallback systems to ensure zero application crashes.

## 🤖 5. AI Feature: AI Crop & Soil Advisor (With Fallback)
The core of TerraTend is the **AI Crop Advisor**. It processes user inputs (Crop Name, Soil Type) to generate highly specific recommendations. 

**Enterprise-Grade AI Architecture:**
* **Lovable AI Gateway:** Gemini AI requests flow securely through a serverless function gateway rather than exposing client-side fetches.
* **Graceful Rule-Based Fallback:** If the AI service experiences downtime, hits rate limits, or loses network connection, the application automatically intercepts the error and falls back to a localized, rule-based agricultural engine to provide immediate, reliable advice. 
* **Input Validation:** A robust validation system filters out invalid gibberish inputs before querying the AI, preventing erroneous API calls.

## ⚙️ 6. System Prompt Used
To generate highly focused, farmer-friendly advice, the backend utilizes the following system prompt architecture:

> "You are an expert agricultural scientist and agronomist. The user will provide a Crop Name and a Soil Type. 
> Validate that the crop is a real agricultural plant. If it is valid, provide exactly three concise, practical bullet points for a small-scale farmer: 
> 1. Irrigation advice specific to this crop in this soil. 
> 2. One fertilizer or nutrient recommendation. 
> 3. One major disease/pest prevention tip. 
> Do not use conversational filler. Format as clean bullet points. If the input is not a recognizable crop, reply strictly with: 'INVALID_CROP'."

## 🛠️ 7. Technologies Used
* **Frontend:** React, Vite, Tailwind CSS
* **UI/UX:** Animated Custom SVGs, CSS Gradients, Lucide React
* **AI Integration:** Google Gemini API (via Lovable AI Gateway)
* **Data Services:** Open-Meteo API (Keyless Geocoding & Weather)
* **Deployment & Hosting:** Lovable 
* **Version Control:** Git, GitHub

## 💻 8. Installation Guide
To run this project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/abbassyed1469/terratend-ai-grow.git](https://github.com/abbassyed1469/terratend-ai-grow.git)
   cd terratend-ai-grow
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   ```
*(Note: Weather data utilizes Open-Meteo and requires no local API keys. AI features are routed through the Lovable AI Gateway).*

## 🚀 9. Deployment Instructions
This project is currently deployed and hosted via Lovable. 
To deploy your own version:
1. Connect your Lovable workspace to a GitHub repository.
2. The Lovable CI/CD pipeline will automatically build and publish the React/Vite application, handling the Serverless AI Gateway configurations automatically.

## 📸 10. Screenshots
<img width="1910" height="911" alt="image" src="https://github.com/user-attachments/assets/cf886127-547d-4c78-9bba-7fa0f994d87e" />





## 🌐 11. Live URL
**[View the Live Application Here](https://terra-tend-ai.lovable.app)** 

## 📁 12. GitHub URL
**[View the Source Code Here](https://github.com/abbassyed1469/terratend-ai-grow.git)** 

## 🔮 13. Future Improvements
* **Automated Device Integration:** Connecting the dashboard directly to IoT soil moisture sensors via MQTT for hyper-accurate local readings.
* **Multi-Language Support:** Integrating localized language support to increase accessibility for regional farmers.
* **User Authentication:** Allowing farmers to create accounts to save their specific plot layouts and historical crop data.

---
**Developed by Syed Abbas Ali Shah**  
