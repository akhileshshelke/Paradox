/**
 * i18n — 22 languages (21 Indian official + English)
 * No circular references — English base defined first, others spread from it.
 */

export type LangCode =
  | "en" | "hi" | "bn" | "te" | "mr" | "ta" | "ur"
  | "gu" | "kn" | "or" | "ml" | "pa" | "as" | "mai"
  | "sa" | "ks" | "ne" | "sd" | "doi" | "mni" | "brx" | "sat";

export interface Translations {
  searchPlaceholder: string; navMap: string; navRankings: string;
  navForecast: string; navAbout: string; login: string;
  live: string; offline: string; airQualityIndex: string;
  lastUpdated: string; moreDetails: string; pollutant: string;
  good: string; satisfactory: string; moderate: string;
  poor: string; veryPoor: string; severe: string;
  aiPrediction: string; aqiWillRiseTo: string; aqiWillFallTo: string;
  aqiWillStayAt: string; inHours: string; in1Hour: string;
  in3Hours: string; in6Hours: string;
  trendIncreasing: string; trendDecreasing: string; trendStable: string;
  smartSuggestions: string; reduceTraffic30: string;
  restrictConstruction: string; closeSchools: string; wearMask: string;
  stayIndoors: string; activateSprinklers: string; limitOutdoor: string;
  airQualityAcceptable: string; whatIfSimulation: string;
  reduceTrafficBtn: string; increaseWindBtn: string; addRainBtn: string;
  simulatedAQI: string; resetSimulation: string; smartAlerts: string;
  alertHazardous: string; alertRisingFast: string;
  alertSensitiveGroups: string; alertAllClear: string;
  weatherConditions: string; humidity: string; windSpeed: string;
  uvIndex: string; windDirection: string; temperature: string;
  liveRankings: string; mostPolluted: string; cleanestCities: string;
  criticalZones: string; healthyZones: string; realTimeAcross: string;
  stations: string; updatesEvery: string; platformFeatures: string;
  whyAirtwin: string; naqi_scale: string; nationalRegime: string;
  regimeCalm: string; regimeStress: string; regimeTransition: string;
  avgAQI: string; critical: string;
  cityStation: string; status: string; rank: string;
  platformMission: string; emergencyAlert: string; seriousRisk: string;
  breathingDiscomfort: string; sensitiveGroups: string;
  minorBreathing: string; minimalImpact: string;
  indiaAqiMap: string; loadingDataset: string;
  liveNodes: string; dataset: string;
  stormy: string; rainy: string; cloudy: string;
  veryHot: string; sunny: string; clearWeather: string;
  pleasant: string; cold: string;
  healthAdvicePerfect: string; healthAdviceAcceptable: string;
  healthAdviceModerate: string; healthAdvicePoor: string;
  healthAdviceVeryPoor: string; healthAdviceHazardous: string;
  aqi: string; pm25_label: string;
  sourceAttribution: string; trafficEmissions: string;
  industrialOutput: string; dustConstruction: string;
  govDashboard: string; policyRecommendation: string;
  transmitAlert: string; systemStatus: string;
  aiReasoning: string; deepInsight: string;
  sourceIndustry: string;
  radarFusion: string; contextSatellite: string;
  digitalTwin: string; simulatedOutcome: string;
  confidence: string; executePolicies: string;
  minimize: string; expand: string;
}

// ── English base (defined first, no dependencies) ──────────────────────────
const EN: Translations = {
  searchPlaceholder: "Search city or station...",
  navMap: "Map", navRankings: "Rankings", navForecast: "Forecast", navAbout: "About",
  login: "Login", live: "LIVE", offline: "OFFLINE",
  airQualityIndex: "Air Quality Index", lastUpdated: "Updated",
  moreDetails: "More Details →", pollutant: "Pollutant",
  good: "Good", satisfactory: "Satisfactory", moderate: "Moderate",
  poor: "Poor", veryPoor: "Very Poor", severe: "Severe",
  aiPrediction: "AI Prediction", aqiWillRiseTo: "AQI will rise to",
  aqiWillFallTo: "AQI will fall to", aqiWillStayAt: "AQI will stay around",
  inHours: "hours", in1Hour: "in 1 hour", in3Hours: "in 3 hours", in6Hours: "in 6 hours",
  trendIncreasing: "↑ Increasing", trendDecreasing: "↓ Decreasing", trendStable: "→ Stable",
  smartSuggestions: "Smart Suggestions",
  reduceTraffic30: "Reduce traffic by 30%",
  restrictConstruction: "Restrict construction activity",
  closeSchools: "Consider school closures",
  wearMask: "Wear N95 masks outdoors",
  stayIndoors: "Stay indoors, avoid exposure",
  activateSprinklers: "Activate road sprinklers",
  limitOutdoor: "Limit outdoor physical activity",
  airQualityAcceptable: "Air quality is acceptable. Safe for all.",
  whatIfSimulation: "What-If Simulation",
  reduceTrafficBtn: "Reduce Traffic", increaseWindBtn: "Increase Wind", addRainBtn: "Add Rain",
  simulatedAQI: "Simulated AQI", resetSimulation: "Reset",
  smartAlerts: "Smart Alerts",
  alertHazardous: "⚠ AQI may become hazardous in 2 hours",
  alertRisingFast: "⚠ AQI rising fast — take precautions now",
  alertSensitiveGroups: "ℹ Sensitive groups: avoid outdoor activity",
  alertAllClear: "✓ Air quality expected to remain stable",
  weatherConditions: "Weather", humidity: "Humidity",
  windSpeed: "Wind Speed", uvIndex: "UV Index", windDirection: "Wind Direction",
  temperature: "Temperature",
  liveRankings: "Live Rankings", mostPolluted: "Most Polluted",
  cleanestCities: "Cleanest Cities", criticalZones: "Critical zones",
  healthyZones: "Healthy zones", realTimeAcross: "Real-time air quality across",
  stations: "monitoring stations", updatesEvery: "Updates every 15 minutes",
  platformFeatures: "Platform Features", whyAirtwin: "Why Air Quality Index?",
  naqi_scale: "India NAQI Scale Reference",
  nationalRegime: "National Regime", regimeCalm: "✅ Calm",
  regimeStress: "🔴 Stress", regimeTransition: "⚠️ Transition",
  avgAQI: "Avg AQI", critical: "Critical",
  cityStation: "City / Station", status: "Status", rank: "#",
  platformMission: "Not just a dashboard, but a brain. Fusing AQI, Weather, and Traffic into a living Digital Twin for predictive oversight and policy simulation.",
  emergencyAlert: "Emergency alert", seriousRisk: "Serious risk",
  breathingDiscomfort: "Breathing discomfort", sensitiveGroups: "Sensitive groups",
  minorBreathing: "Minor breathing", minimalImpact: "Minimal impact",
  indiaAqiMap: "India AQI Map", loadingDataset: "Loading India AQI dataset...",
  liveNodes: "Live nodes", dataset: "Dataset",
  stormy: "Stormy", rainy: "Rainy", cloudy: "Cloudy",
  veryHot: "Very Hot", sunny: "Sunny", clearWeather: "Clear",
  pleasant: "Pleasant", cold: "Cold",
  healthAdvicePerfect: "Perfect air! Safe for all.",
  healthAdviceAcceptable: "Acceptable. Sensitive groups take care.",
  healthAdviceModerate: "Moderate. Limit outdoor time.",
  healthAdvicePoor: "Poor. Wear mask outdoors.",
  healthAdviceVeryPoor: "Very Poor! Stay indoors.",
  healthAdviceHazardous: "Hazardous! Emergency level!",
  aqi: "AQI", pm25_label: "PM2.5",
  sourceAttribution: "Source Attribution",
  trafficEmissions: "Traffic Emissions",
  industrialOutput: "Industrial Output",
  dustConstruction: "Dust & Construction",
  govDashboard: "Government Dashboard (DSS)",
  policyRecommendation: "Policy Recommendation",
  transmitAlert: "TRANSMIT ALERT",
  systemStatus: "System Status",
  aiReasoning: "AI Reasoning Engine",
  deepInsight: "Deep Insight",
  sourceIndustry: "Targeting: Industry",
  radarFusion: "Multi-Data Fusion Matrix",
  contextSatellite: "LIVE Context: High Satellite-Ground Correlation",
  digitalTwin: "Digital Twin Simulation",
  simulatedOutcome: "Simulated Outcome",
  confidence: "Confidence",
  executePolicies: "EXECUTE SELECTED POLICIES",
  minimize: "Minimize",
  expand: "Expand",
};

// ── All 22 translations ────────────────────────────────────────────────────
const translations: Record<LangCode, Translations> = {
  en: EN,

  hi: { ...EN,
    searchPlaceholder: "शहर या स्टेशन खोजें...",
    navMap: "मानचित्र", navRankings: "रैंकिंग", navForecast: "पूर्वानुमान", navAbout: "बारे में",
    login: "लॉगिन", live: "लाइव", offline: "ऑफलाइन",
    airQualityIndex: "वायु गुणवत्ता सूचकांक", lastUpdated: "अपडेट", moreDetails: "अधिक जानकारी →",
    good: "अच्छा", satisfactory: "संतोषजनक", moderate: "मध्यम",
    poor: "खराब", veryPoor: "बहुत खराब", severe: "गंभीर",
    aiPrediction: "AI पूर्वानुमान", aqiWillRiseTo: "AQI बढ़कर होगा",
    aqiWillFallTo: "AQI घटकर होगा",
    in1Hour: "1 घंटे में", in3Hours: "3 घंटे में", in6Hours: "6 घंटे में",
    trendIncreasing: "↑ बढ़ रहा है", trendDecreasing: "↓ घट रहा है", trendStable: "→ स्थिर",
    smartSuggestions: "स्मार्ट सुझाव",
    reduceTraffic30: "यातायात 30% कम करें", restrictConstruction: "निर्माण गतिविधि पर रोक",
    closeSchools: "स्कूल बंद करने पर विचार करें", wearMask: "बाहर N95 मास्क पहनें",
    stayIndoors: "घर के अंदर रहें", activateSprinklers: "सड़क पर पानी छिड़कें",
    limitOutdoor: "बाहरी गतिविधि सीमित करें", airQualityAcceptable: "वायु गुणवत्ता स्वीकार्य है।",
    whatIfSimulation: "क्या-अगर सिमुलेशन",
    reduceTrafficBtn: "यातायात कम करें", increaseWindBtn: "हवा बढ़ाएं", addRainBtn: "बारিশ जोड़ें",
    simulatedAQI: "सिम्युलेटेड AQI", resetSimulation: "रीसेट",
    smartAlerts: "स्मार्ट अलर्ट",
    alertHazardous: "⚠ AQI 2 घंटे में खतरनाक हो सकता है",
    alertRisingFast: "⚠ AQI तेजी से बढ़ रहा — अभी सावधानी बरतें",
    alertSensitiveGroups: "ℹ संवेदनशील समूह: बाहरी गतिविधि से बचें",
    alertAllClear: "✓ वायु गुणवत्ता स्थिर रहने की उम्मीद",
    humidity: "आर्द्रता", windSpeed: "हवा की गति", uvIndex: "UV सूचकांक", temperature: "तापमान",
    liveRankings: "लाइव रैंकिंग", mostPolluted: "सबसे प्रदूषित", cleanestCities: "सबसे स्वच्छ शहर",
    criticalZones: "संकट क्षेत्र", healthyZones: "स्वस्थ क्षेत्र",
    updatesEvery: "हर 15 मिनट में अपडेट",
    whyAirtwin: "Air Quality Index क्यों?", nationalRegime: "राष्ट्रीय व्यवस्था",
    regimeCalm: "✅ शांत", regimeStress: "🔴 तनाव", regimeTransition: "⚠️ परिवर्तन",
    avgAQI: "औसत AQI", critical: "गंभीर",
    cityStation: "शहर / स्टेशन", status: "स्थिति", rank: "#",
    platformMission: "भारत के लिए सबसे व्यापक एआई-संचालित पर्यावरणीय खुफिया मंच।",
    emergencyAlert: "आपातकालीन चेतावनी", seriousRisk: "गंभीर जोखिम",
    breathingDiscomfort: "सांस लेने में तकलीफ", sensitiveGroups: "संवेदनशील समूह",
    minorBreathing: "मामूली सांस", minimalImpact: "न्यूनतम प्रभाव",
    indiaAqiMap: "भारत AQI मानचित्र", loadingDataset: "भारत AQI डेटासेट लोड हो रहा है...",
    liveNodes: "लाइव नोड्स", dataset: "डेटासेट",
    stormy: "तूफानी", rainy: "बारिश", cloudy: "बादल",
    veryHot: "बहुत गर्म", sunny: "धूप", clearWeather: "साफ",
    pleasant: "सुहावना", cold: "ठंडा",
    healthAdvicePerfect: "उत्कृष्ट वायु! सभी के लिए सुरक्षित।",
    healthAdviceAcceptable: "स्वीकार्य। संवेदनशील समूह ध्यान रखें।",
    healthAdviceModerate: "मध्यम। बाहरी समय सीमित करें।",
    healthAdvicePoor: "खराब। बाहर मास्क पहनें।",
    healthAdviceVeryPoor: "बहुत खराब! अंदर रहें।",
    healthAdviceHazardous: "खतरनाक! आपातकालीन स्तर!",
    aiReasoning: "AI तर्क इंजन",
    deepInsight: "गहरी अंतर्दृष्टि",
    sourceAttribution: "स्रोत एट्रिब्यूशन",
    sourceIndustry: "लक्ष्य: उद्योग",
    radarFusion: "मल्टी-डेटा फ्यूजन मैट्रिक्स",
    contextSatellite: "लाइव संदर्भ: उच्च उपग्रह-जमीन सहसंबंध",
    digitalTwin: "डिजिटल ट्विन सिमुलेशन",
    simulatedOutcome: "सिम्युलेटेड परिणाम",
    confidence: "विश्वास",
    executePolicies: "चयनित नीतियों को लागू करें",
    minimize: "छोटा करें",
    expand: "बड़ा करें",
  },

  bn: { ...EN,
    searchPlaceholder: "শহর বা স্টেশন খুঁজুন...",
    navMap: "মানচিত্র", navRankings: "র‍্যাংকিং", navForecast: "পূর্বাভাস", navAbout: "সম্পর্কে",
    login: "লগইন", live: "লাইভ", offline: "অফলাইন",
    airQualityIndex: "বায়ু মান সূচক", lastUpdated: "আপডেট", moreDetails: "আরো বিস্তারিত →",
    good: "ভালো", satisfactory: "সন্তোষজনক", moderate: "মাঝারি",
    poor: "খারাপ", veryPoor: "অত্যন্ত খারাপ", severe: "মারাত্মক",
    aiPrediction: "AI পূর্বাভাস", aqiWillRiseTo: "AQI বেড়ে হবে", aqiWillFallTo: "AQI কমে হবে",
    in1Hour: "১ ঘণ্টায়", in3Hours: "৩ ঘণ্টায়", in6Hours: "৬ ঘণ্টায়",
    trendIncreasing: "↑ বাড়ছে", trendDecreasing: "↓ কমছে", trendStable: "→ স্থিতিশীল",
    smartSuggestions: "স্মার্ট পরামর্শ",
    reduceTraffic30: "যানজট ৩০% কমান", wearMask: "বাইরে N95 মাস্ক পরুন",
    stayIndoors: "ঘরে থাকুন", alertHazardous: "⚠ AQI ২ ঘণ্টায় বিপজ্জনক হতে পারে",
    alertAllClear: "✓ বায়ু মান স্থিতিশীল থাকবে",
    humidity: "আর্দ্রতা", windSpeed: "বায়ুবেগ", uvIndex: "UV সূচক", temperature: "তাপমাত্রা",
    liveRankings: "লাইভ র‍্যাংকিং", mostPolluted: "সবচেয়ে দূষিত", cleanestCities: "সবচেয়ে পরিষ্কার",
    whyAirtwin: "কেন Air Quality Index?", avgAQI: "গড় AQI", critical: "জরুরি",
    cityStation: "শহর / স্টেশন", status: "অবস্থান", rank: "#",
  },

  te: { ...EN,
    searchPlaceholder: "నగరం లేదా స్టేషన్ వెతకండి...",
    navMap: "మ్యాప్", navRankings: "ర్యాంకింగ్స్", navForecast: "అంచనా", navAbout: "గురించి",
    login: "లాగిన్", live: "లైవ్", airQualityIndex: "వాయు నాణ్యత సూచిక",
    good: "మంచిది", satisfactory: "సంతృప్తికరం", moderate: "మధ్యస్థం",
    poor: "పేద", veryPoor: "చాలా పేద", severe: "తీవ్రమైన",
    aiPrediction: "AI అంచనా", trendIncreasing: "↑ పెరుగుతోంది",
    trendDecreasing: "↓ తగ్గుతోంది", trendStable: "→ స్థిరంగా",
    reduceTrafficBtn: "రవాణా తగ్గించు", increaseWindBtn: "గాలి పెంచు", addRainBtn: "వర్షం జోడించు",
    humidity: "తేమ", windSpeed: "గాలి వేగం", temperature: "ఉష్ణోగ్రత",
    liveRankings: "లైవ్ ర్యాంకింగ్స్", mostPolluted: "అత్యంత కాలుష్యం",
    whyAirtwin: "ఎందుకు Air Quality Index?", avgAQI: "సగటు AQI", critical: "క్లిష్ట",
  },

  mr: { ...EN,
    searchPlaceholder: "शहर किंवा स्थानक शोधा...",
    navMap: "नकाशा", navRankings: "क्रमवारी", navForecast: "अंदाज", navAbout: "बद्दल",
    login: "लॉगिन", live: "लाइव्ह", airQualityIndex: "हवा गुणवत्ता निर्देशांक",
    good: "चांगले", satisfactory: "समाधानकारक", moderate: "मध्यम",
    poor: "खराब", veryPoor: "अत्यंत खराब", severe: "गंभीर",
    aiPrediction: "AI अंदाज", trendIncreasing: "↑ वाढत आहे",
    trendDecreasing: "↓ कमी होत आहे", trendStable: "→ स्थिर",
    reduceTrafficBtn: "वाहतूक कमी करा", increaseWindBtn: "वारा वाढवा", addRainBtn: "पाऊस जोडा",
    humidity: "आर्द्रता", windSpeed: "वाऱ्याचा वेग", temperature: "तापमान",
    liveRankings: "लाइव्ह क्रमवारी", mostPolluted: "सर्वाधिक प्रदूषित",
    whyAirtwin: "Air Quality Index का?", avgAQI: "सरासरी AQI", critical: "गंभीर",
  },

  ta: { ...EN,
    searchPlaceholder: "நகரம் அல்லது நிலையம் தேடு...",
    navMap: "வரைபடம்", navRankings: "தரவரிசை", navForecast: "முன்கணிப்பு", navAbout: "பற்றி",
    login: "உள்நுழைவு", live: "நேரடி", airQualityIndex: "காற்று தர குறியீடு",
    good: "நல்லது", satisfactory: "திருப்திகரமான", moderate: "மிதமான",
    poor: "மோசம்", veryPoor: "மிகவும் மோசம்", severe: "தீவிரமான",
    aiPrediction: "AI முன்கணிப்பு", trendIncreasing: "↑ அதிகரிக்கிறது",
    trendDecreasing: "↓ குறைகிறது", trendStable: "→ நிலையான",
    reduceTrafficBtn: "போக்குவரத்து குறைக்கவும்",
    increaseWindBtn: "காற்று அதிகரிக்கவும்", addRainBtn: "மழை சேர்க்கவும்",
    humidity: "ஈரப்பதம்", windSpeed: "காற்று வேகம்", temperature: "வெப்பநிலை",
    liveRankings: "நேரடி தரவரிசை", mostPolluted: "அதிக மாசுபட்டது",
    whyAirtwin: "ஏன் Air Quality Index?", avgAQI: "சராசரி AQI", critical: "முக்கியமான",
  },

  ur: { ...EN,
    searchPlaceholder: "شہر یا اسٹیشن تلاش کریں...",
    navMap: "نقشہ", navRankings: "درجہ بندی", navForecast: "پیش گوئی", navAbout: "کے بارے میں",
    login: "لاگ ان", live: "لائیو", airQualityIndex: "فضائی معیار کا اشاریہ",
    good: "اچھا", satisfactory: "تسلی بخش", moderate: "اعتدال پسند",
    poor: "خراب", veryPoor: "بہت خراب", severe: "شدید",
    aiPrediction: "AI پیش گوئی", trendIncreasing: "↑ بڑھ رہا ہے",
    trendDecreasing: "↓ گھٹ رہا ہے", trendStable: "→ مستحکم",
    reduceTrafficBtn: "ٹریفک کم کریں", increaseWindBtn: "ہوا بڑھائیں", addRainBtn: "بارش شامل کریں",
    humidity: "نمی", windSpeed: "ہوا کی رفتار", temperature: "درجۂ حرارت",
    liveRankings: "لائیو درجہ بندی", mostPolluted: "سب سے آلودہ",
    whyAirtwin: "کیوں Air Quality Index?", avgAQI: "اوسط AQI", critical: "نازک",
  },

  gu: { ...EN,
    searchPlaceholder: "શહેર અથવા સ્ટેશન શોધો...",
    navMap: "નકશો", navRankings: "ક્રમ", navForecast: "આગાહી", navAbout: "વિષે",
    login: "લૉગિન", live: "લાઇવ", airQualityIndex: "હવા ગુણવત્તા સૂચકાંક",
    good: "સારું", satisfactory: "સંતોષકારક", moderate: "મધ્યમ",
    poor: "ખરાબ", veryPoor: "ખૂબ ખરાબ", severe: "ગંભીર",
    aiPrediction: "AI આગાહી", trendIncreasing: "↑ વધી રહ્યું",
    trendDecreasing: "↓ ઘટી રહ્યું", trendStable: "→ સ્થિર",
    reduceTrafficBtn: "ટ્રાફિક ઘટાડો", increaseWindBtn: "પવન વધારો", addRainBtn: "વરસાદ ઉમેરો",
    humidity: "ભેજ", windSpeed: "પવનની ઝડપ", temperature: "તાપમાન",
    liveRankings: "લાઇવ ક્રમ", mostPolluted: "સૌથી પ્રદૂષિત",
    whyAirtwin: "Air Quality Index કેમ?", avgAQI: "સરેરાશ AQI", critical: "ગંભીર",
  },

  kn: { ...EN,
    searchPlaceholder: "ನಗರ ಅಥವಾ ನಿಲ್ದಾಣ ಹುಡುಕಿ...",
    navMap: "ನಕ್ಷೆ", navRankings: "ಶ್ರೇಣೀಕರಣ", navForecast: "ಮುನ್ಸೂಚನೆ", navAbout: "ಬಗ್ಗೆ",
    login: "ಲಾಗಿನ್", live: "ನೇರ", airQualityIndex: "ಗಾಳಿ ಗುಣಮಟ್ಟ ಸೂಚಿ",
    good: "ಒಳ್ಳೆಯದು", satisfactory: "ತೃಪ್ತಿಕರ", moderate: "ಮಧ್ಯಮ",
    poor: "ಕಳಪೆ", veryPoor: "ತೀರಾ ಕಳಪೆ", severe: "ತೀವ್ರ",
    reduceTrafficBtn: "ಸಂಚಾರ ಕಡಿಮೆ ಮಾಡಿ", increaseWindBtn: "ಗಾಳಿ ಹೆಚ್ಚಿಸಿ", addRainBtn: "ಮಳೆ ಸೇರಿಸಿ",
    humidity: "ತೇವಾಂಶ", windSpeed: "ಗಾಳಿ ವೇಗ", temperature: "ಉಷ್ಣಾಂಶ",
    liveRankings: "ನೇರ ಶ್ರೇಣೀಕರಣ", mostPolluted: "ಅತ್ಯಂತ ಮಲಿನ",
    whyAirtwin: "ಏಕೆ Air Quality Index?", avgAQI: "ಸರಾಸರಿ AQI", critical: "ಗಂಭೀರ",
  },

  or: { ...EN,
    searchPlaceholder: "ସହର ବା ଷ୍ଟେସନ ଖୋଜ...",
    navMap: "ମାନଚିତ୍ର", navRankings: "ର‍୍ୟାଙ୍କ", navForecast: "ପୂର୍ବାନୁମାନ", navAbout: "ବିଷୟ",
    login: "ଲଗଇନ", live: "ଲାଇଭ", airQualityIndex: "ବାୟୁ ଗୁଣ ସୂଚକ",
    good: "ଭଲ", satisfactory: "ସନ୍ତୋଷଜନକ", moderate: "ମଧ୍ୟମ",
    poor: "ଖରାପ", veryPoor: "ବହୁ ଖରାପ", severe: "ଗୁରୁତର",
    humidity: "ଆର୍ଦ୍ରତା", windSpeed: "ବାୟୁ ବେଗ", temperature: "ତାପମାନ",
    whyAirtwin: "Air Quality Index କାହିଁକି?", avgAQI: "ହାରାହାରି AQI", critical: "ଗୁରୁତ୍ୱ",
  },

  ml: { ...EN,
    searchPlaceholder: "നഗരം അല്ലെങ്കിൽ സ്റ്റേഷൻ തിരയുക...",
    navMap: "ഭൂപടം", navRankings: "റാങ്കിംഗ്", navForecast: "പ്രവചനം", navAbout: "കുറിച്ച്",
    login: "ലോഗിൻ", live: "തത്സമയം", airQualityIndex: "വായു ഗുണനിലവാര സൂചിക",
    good: "നല്ലത്", satisfactory: "തൃപ്തികരം", moderate: "മിതമായ",
    poor: "മോശം", veryPoor: "വളരെ മോശം", severe: "ഗുരുതരം",
    reduceTrafficBtn: "ഗതാഗതം കുറക്കുക", increaseWindBtn: "കാറ്റ് കൂട്ടുക", addRainBtn: "മഴ ചേർക്കുക",
    humidity: "ഈർപ്പം", windSpeed: "കാറ്റ് വേഗം", temperature: "താപനില",
    liveRankings: "തത്സമയ റാങ്കിംഗ്", mostPolluted: "ഏറ്റവും മലിനമായ",
    whyAirtwin: "എന്തുകൊണ്ട് Air Quality Index?", avgAQI: "ശരാശരി AQI", critical: "ഗുരുതരം",
  },

  pa: { ...EN,
    searchPlaceholder: "ਸ਼ਹਿਰ ਜਾਂ ਸਟੇਸ਼ਨ ਖੋਜੋ...",
    navMap: "ਨਕਸ਼ਾ", navRankings: "ਦਰਜਾਬੰਦੀ", navForecast: "ਭਵਿੱਖਬਾਣੀ", navAbout: "ਬਾਰੇ",
    login: "ਲੌਗਿਨ", live: "ਲਾਈਵ", airQualityIndex: "ਹਵਾ ਗੁਣਵੱਤਾ ਸੂਚਕਾਂਕ",
    good: "ਚੰਗਾ", satisfactory: "ਸੰਤੋਸ਼ਜਨਕ", moderate: "ਮੱਧਮ",
    poor: "ਮਾੜਾ", veryPoor: "ਬਹੁਤ ਮਾੜਾ", severe: "ਗੰਭੀਰ",
    reduceTrafficBtn: "ਟ੍ਰੈਫਿਕ ਘਟਾਓ", increaseWindBtn: "ਹਵਾ ਵਧਾਓ", addRainBtn: "ਮੀਂਹ ਜੋੜੋ",
    humidity: "ਨਮੀ", windSpeed: "ਹਵਾ ਦੀ ਰਫ਼ਤਾਰ", temperature: "ਤਾਪਮਾਨ",
    liveRankings: "ਲਾਈਵ ਦਰਜਾਬੰਦੀ", mostPolluted: "ਸਭ ਤੋਂ ਪ੍ਰਦੂਸ਼ਿਤ",
    whyAirtwin: "ਕਿਉਂ Air Quality Index?", avgAQI: "ਔਸਤ AQI", critical: "ਗੰਭੀਰ",
  },

  as:  { ...EN, searchPlaceholder: "চহর বা ষ্টেচন বিচাৰক...", navMap: "মানচিত্ৰ", navRankings: "শ্ৰেণীবিভাজন", good: "ভাল", satisfactory: "সন্তোষজনক", moderate: "মধ্যমীয়া", poor: "বেয়া", veryPoor: "অতি বেয়া", severe: "গুৰুতৰ", humidity: "আৰ্দ্ৰতা", temperature: "উষ্ণতা" },
  mai: { ...EN, searchPlaceholder: "शहर या स्टेशन खोजू...", navMap: "नक्शा", good: "नीक", satisfactory: "संतोषजनक", moderate: "मध्यम", poor: "खराब", veryPoor: "बहुत खराब", severe: "गंभीर" },
  sa:  { ...EN, searchPlaceholder: "नगरं स्थानकं वा अन्विष्य...", navMap: "मानचित्रम्", good: "उत्तमम्", satisfactory: "सन्तोषजनकम्", moderate: "मध्यमम्", poor: "न्यूनम्", veryPoor: "अत्यल्पम्", severe: "गुरुतरम्" },
  ks:  { ...EN, searchPlaceholder: "شہر یا اسٹیشن لبِہ...", navMap: "نقشہ", good: "بہتر", satisfactory: "قابلِ قبول", moderate: "درمیانہ", poor: "خراب", veryPoor: "بوہت خراب", severe: "سنگین" },
  ne:  { ...EN, searchPlaceholder: "सहर वा स्टेशन खोज्नुहोस्...", navMap: "नक्सा", good: "राम्रो", satisfactory: "सन्तोषजनक", moderate: "मध्यम", poor: "खराब", veryPoor: "धेरै खराब", severe: "गम्भीर" },
  sd:  { ...EN, searchPlaceholder: "شهر يا اسٽيشن ڳولهيو...", navMap: "نقشو", good: "سٺو", satisfactory: "تسلي بخش", moderate: "وچولو", poor: "خراب", veryPoor: "تمام خراب", severe: "شديد" },
  doi: { ...EN, searchPlaceholder: "शहर जां स्टेशन लब्भो...", navMap: "नक्शा", good: "चंगा", satisfactory: "संतोषजनक", moderate: "मध्यम", poor: "मन्दा", veryPoor: "बड्डा मन्दा", severe: "गंभीर" },
  mni: { ...EN, searchPlaceholder: "ꯁꯤꯗꯥ ꯅꯥꯏꯅꯩ...", navMap: "ꯃꯦꯞ", good: "ꯉꯥꯛꯄ", satisfactory: "ꯁꯟꯇꯣꯁ", moderate: "ꯃꯤꯇꯥꯝ", poor: "ꯌꯥꯝꯅ", veryPoor: "ꯑꯅꯤꯡꯕ", severe: "ꯁꯥꯒꯤ" },
  brx: { ...EN, searchPlaceholder: "थाखो नं स्टेशन बायो...", navMap: "नक्शा", good: "नागोन", satisfactory: "सोंनाय", moderate: "मध्यम", poor: "खोमानि", veryPoor: "बोहोम", severe: "गोबां" },
  sat: { ...EN, searchPlaceholder: "ᱟᱰᱟ ᱧᱮᱞ...", navMap: "ᱧᱟᱸᱜᱟ", good: "ᱢᱟᱺᱠ", satisfactory: "ᱜᱩᱱ", moderate: "ᱢᱷᱚᱱᱽᱤᱢ", poor: "ᱴᱷᱤᱠ", veryPoor: "ᱵᱷᱩᱞ", severe: "ᱠᱟᱹᱴᱤᱱ" },
};

export const LANG_LIST: { code: LangCode; name: string; native: string; rtl?: boolean }[] = [
  { code: "en",  name: "English",    native: "English" },
  { code: "hi",  name: "Hindi",      native: "हिंदी" },
  { code: "bn",  name: "Bengali",    native: "বাংলা" },
  { code: "te",  name: "Telugu",     native: "తెలుగు" },
  { code: "mr",  name: "Marathi",    native: "मराठी" },
  { code: "ta",  name: "Tamil",      native: "தமிழ்" },
  { code: "ur",  name: "Urdu",       native: "اردو", rtl: true },
  { code: "gu",  name: "Gujarati",   native: "ગુજરાતી" },
  { code: "kn",  name: "Kannada",    native: "ಕನ್ನಡ" },
  { code: "or",  name: "Odia",       native: "ଓଡ଼ିଆ" },
  { code: "ml",  name: "Malayalam",  native: "മലയാളം" },
  { code: "pa",  name: "Punjabi",    native: "ਪੰਜਾਬੀ" },
  { code: "as",  name: "Assamese",   native: "অসমীয়া" },
  { code: "mai", name: "Maithili",   native: "मैथिली" },
  { code: "sa",  name: "Sanskrit",   native: "संस्कृतम्" },
  { code: "ks",  name: "Kashmiri",   native: "کٲشُر", rtl: true },
  { code: "ne",  name: "Nepali",     native: "नेपाली" },
  { code: "sd",  name: "Sindhi",     native: "سنڌي", rtl: true },
  { code: "doi", name: "Dogri",      native: "डोगरी" },
  { code: "mni", name: "Manipuri",   native: "মৈতৈলোন্" },
  { code: "brx", name: "Bodo",       native: "बड़ो" },
  { code: "sat", name: "Santali",    native: "ᱥᱟᱱᱛᱟᱲᱤ" },
];

export function t(lang: LangCode, key: keyof Translations): string {
  return translations[lang]?.[key] ?? EN[key] ?? (key as string);
}

export default translations;
