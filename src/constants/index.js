export const SIDEBAR_WIDE = 260;
export const SIDEBAR_SLIM = 70;

export const VOICES = [
  { name: "Shubh", gender: "Male", seed: "shubh-voice", desc: "Friendly default voice for IVR and support" },
  { name: "Ritu", gender: "Female", seed: "ritu-voice", desc: "Soft, approachable voice for customer interactions" },
  { name: "Amit", gender: "Male", seed: "amit-voice", desc: "Formal voice for business communications" },
  { name: "Sumit", gender: "Male", seed: "sumit-voice", desc: "Balanced warmth with professionalism" },
  { name: "Pooja", gender: "Female", seed: "pooja-voice", desc: "Encouraging voice for assistance flows" },
  { name: "Manan", gender: "Male", seed: "manan-voice", desc: "Consistent voice for automated systems" },
  { name: "Simran", gender: "Female", seed: "simran-voice", desc: "Expressive voice for storytelling" },
  { name: "Ananya", gender: "Female", seed: "ananya-voice", desc: "Warm tone for conversational assistants" },
  { name: "Arjun", gender: "Male", seed: "arjun-voice", desc: "Deep authoritative voice for presentations" },
];

export const GITHUB_REPOS = [
  { name: "react-dashboard", owner: "johndoe", url: "https://github.com/johndoe/react-dashboard", desc: "Modern React dashboard with analytics" },
  { name: "nodejs-api", owner: "johndoe", url: "https://github.com/johndoe/nodejs-api", desc: "RESTful API built with Node.js and Express" },
  { name: "python-ml-project", owner: "johndoe", url: "https://github.com/johndoe/python-ml-project", desc: "Machine learning project using Python" },
  { name: "vue-ecommerce", owner: "johndoe", url: "https://github.com/johndoe/vue-ecommerce", desc: "E-commerce platform built with Vue.js" },
  { name: "flutter-mobile-app", owner: "johndoe", url: "https://github.com/johndoe/flutter-mobile-app", desc: "Cross-platform mobile app with Flutter" },
  { name: "django-blog", owner: "johndoe", url: "https://github.com/johndoe/django-blog", desc: "Blog application using Django framework" },
];

export const VOICE_TABS = ["Import from GitHub"];
export const LANGUAGES = ["Hindi", "English", "Bengali", "Tamil", "Telugu", "Marathi", "Gujarati", "Kannada"];
export const MODELS = ["Bulbul V3", "Bulbul V2", "Bulbul V1"];
export const QUALITIES = ["Standard (22.05 kHz)", "High (44.1 kHz)"];

export const DEFAULT_TTS_TEXT = `नमस्ते! Sarvam AI में आपका स्वागत है।

हम भारतीय भाषाओं के लिए अत्याधुनिक voice technology बनाते हैं। हमारे text-to-speech models प्राकृतिक और इंसान जैसी आवाज़ें produce करते हैं, जो बेहद realistic लगती हैं।

आप अपना text type कर सकते हैं या different voices को try करने के लिए किसी भी voice card पर play button पर click कर सकते हैं। तो चलिए, अपनी भाषा में AI की ताकत experience करें!`;

export const PAGE_META = {
  project: { title: "Projects", sub: "Manage your projects and resources" },
  add: { title: "New Project", sub: "Create and configure your AI-powered DevOps project" },
  deploy: { title: "Deployments", sub: "View and manage your project deployments" },
  tts: { title: "Text to Speech", sub: "Convert text to natural speech in Indian languages" },
  billing: { title: "Billing", sub: "Manage your credits and payment history" },
  home: { title: "Home", sub: "" },
  vision: { title: "Deployments", sub: "View and manage your project deployments" },
  stt: { title: "Speech to Text", sub: "" },
  trans: { title: "Translate", sub: "" },
  agents: { title: "Conversational Agents", sub: "" },
  video: { title: "Video Dubbing", sub: "" },
  api: { title: "API Keys", sub: "" },
  usage: { title: "Usage", sub: "" },
  pricing: { title: "Pricing", sub: "" },
  docs: { title: "Documentation", sub: "" },
};
