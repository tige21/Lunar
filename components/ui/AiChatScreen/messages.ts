import { LocalizedMessages, TimingConfig } from './types';

export const LOCALIZED_MESSAGES: LocalizedMessages = {
  en: [
    {
      text: "Hi Luna! I've been having trouble falling asleep lately. Can you help?",
      isUser: true,
      type: 'text'
    },
    {
      text: "Hello! I'd love to help you improve your sleep. Based on your recent patterns, I notice you've been going to bed around 11:30 PM but not falling asleep until after midnight. Let's work on optimizing your sleep routine.",
      isUser: false,
      type: 'insight'
    },
    {
      text: "How did you know that? That's exactly what's been happening!",
      isUser: true,
      type: 'text'
    },
    {
      text: "I analyze your sleep data to identify patterns and trends. Here are 3 personalized recommendations to help you fall asleep faster:\n\n🌙 Try a 'wind-down' routine starting 30 minutes before bed\n📱 Reduce screen time after 10 PM\n🫖 Consider herbal tea or light stretching before bedtime",
      isUser: false,
      type: 'recommendation'
    },
    {
      text: "These suggestions sound really helpful! Can you track my progress?",
      isUser: true,
      type: 'text'
    },
    {
      text: "Absolutely! I'll monitor your sleep quality, track improvements, and adjust recommendations based on what works best for you. Think of me as your personal sleep coach, available 24/7 to help you achieve better rest. 😴✨",
      isUser: false,
      type: 'insight'
    },
    {
      text: "What about my sleep environment? My room gets pretty warm at night.",
      isUser: true,
      type: 'text'
    },
    {
      text: "Great question! Sleep environment is crucial for quality rest. For optimal sleep, keep your bedroom between 60-67°F (15-19°C). Here's what you can do:\n\n❄️ Use a fan or adjust AC settings\n🪟 Open windows for natural cooling\n🛏️ Choose breathable, lightweight bedding\n🌡️ Consider a cooling mattress pad",
      isUser: false,
      type: 'recommendation'
    },
    {
      text: "I also wake up a lot during the night. Is that normal?",
      isUser: true,
      type: 'text'
    },
    {
      text: "Some brief awakenings are normal, but frequent disruptions can affect sleep quality. I've noticed you've had 3-4 wake episodes per night lately. This could be due to:\n\n💧 Late evening fluid intake\n☕ Caffeine after 2 PM\n📱 Light exposure from devices\n🧠 Stress or racing thoughts",
      isUser: false,
      type: 'insight'
    },
    {
      text: "You're right about the caffeine! I usually have coffee around 4 PM. Should I cut it out completely?",
      isUser: true,
      type: 'text'
    },
    {
      text: "You don't need to eliminate caffeine entirely! Just adjust the timing. Try switching your 4 PM coffee to:\n\n🌅 Morning coffee (6-10 AM)\n🍃 Herbal tea in the afternoon\n💧 Plenty of water throughout the day\n\nCaffeine has a 6-8 hour half-life, so having it after 2 PM can definitely impact your sleep.",
      isUser: false,
      type: 'recommendation'
    },
    {
      text: "This is amazing! How do you learn so much about my sleep patterns?",
      isUser: true,
      type: 'text'
    },
    {
      text: "I continuously analyze data from your sleep tracking, daily habits, and our conversations to build a comprehensive understanding of your sleep health. The more we chat, the better I become at providing personalized insights! 🤖💤",
      isUser: false,
      type: 'insight'
    },
    {
      text: "Can you help me with my morning routine too?",
      isUser: true,
      type: 'text'
    },
    {
      text: "Absolutely! Your morning routine is just as important as your bedtime routine. I notice you typically wake up around 7 AM. Let's optimize your mornings for better energy:",
      isUser: false,
      type: 'text'
    },
    {
      text: "☀️ Get sunlight within 30 minutes of waking\n🚿 Try a cool shower to boost alertness\n💧 Drink water before coffee\n🧘 5-minute meditation or stretching",
      isUser: false,
      type: 'recommendation'
    },
    {
      text: "I struggle with feeling groggy in the mornings. Any tips?",
      isUser: true,
      type: 'text'
    },
    {
      text: "Morning grogginess often indicates sleep debt or inconsistent sleep schedule. Based on your data, you're getting about 6.5 hours on average - try aiming for 7-8 hours consistently.",
      isUser: false,
      type: 'insight'
    },
    {
      text: "What about weekends? I like to sleep in...",
      isUser: true,
      type: 'text'
    },
    {
      text: "I understand the temptation! However, sleeping in more than 1 hour past your usual time can disrupt your circadian rhythm. Try gradual 15-minute adjustments instead.",
      isUser: false,
      type: 'recommendation'
    },
    {
      text: "This makes so much sense! How do you track all this?",
      isUser: true,
      type: 'text'
    },
    {
      text: "I integrate with your device's health data, sleep sensors, and our conversations to create a complete picture. Privacy is key - everything stays on your device! 🔒",
      isUser: false,
      type: 'insight'
    },
    {
      text: "Can you remind me about my bedtime routine?",
      isUser: true,
      type: 'text'
    },
    {
      text: "Of course! I can send gentle reminders 30 minutes before your optimal bedtime. Would you like me to set that up for 10:30 PM based on your sleep goals?",
      isUser: false,
      type: 'text'
    },
    {
      text: "Yes, that would be perfect!",
      isUser: true,
      type: 'text'
    },
    {
      text: "Great! I've set up your bedtime reminder. I'll also track how well you follow the routine and adjust recommendations based on what works best for you. Sweet dreams! 🌙✨",
      isUser: false,
      type: 'insight'
    }
  ],
  ru: [
    {
      text: "Привет, Луна! У меня проблемы с засыпанием в последнее время. Можешь помочь?",
      isUser: true,
      type: 'text'
    },
    {
      text: "Привет! Буду рада помочь улучшить ваш сон. Анализируя ваши недавние паттерны, замечаю, что вы ложитесь спать около 23:30, но засыпаете только после полуночи. Давайте оптимизируем вашу рутину сна.",
      isUser: false,
      type: 'insight'
    },
    {
      text: "Откуда ты это знаешь? Именно так и происходит!",
      isUser: true,
      type: 'text'
    },
    {
      text: "Я анализирую ваши данные о сне для выявления паттернов и трендов. Вот 3 персонализированные рекомендации для быстрого засыпания:\n\n🌙 Попробуйте ритуал расслабления за 30 минут до сна\n📱 Ограничьте время у экранов после 22:00\n🫖 Рассмотрите травяной чай или легкую растяжку перед сном",
      isUser: false,
      type: 'recommendation'
    },
    {
      text: "Эти советы звучат очень полезно! Можешь отслеживать мой прогресс?",
      isUser: true,
      type: 'text'
    },
    {
      text: "Конечно! Я буду отслеживать качество вашего сна, прогресс и корректировать рекомендации в зависимости от того, что работает лучше для вас. Думайте обо мне как о личном тренере по сну, доступном 24/7 для достижения лучшего отдыха. 😴✨",
      isUser: false,
      type: 'insight'
    },
    {
      text: "А что насчет окружения для сна? В моей комнате довольно тепло по ночам.",
      isUser: true,
      type: 'text'
    },
    {
      text: "Отличный вопрос! Окружение для сна крайне важно для качественного отдыха. Для оптимального сна поддерживайте температуру в спальне 15-19°C. Вот что можно сделать:\n\n❄️ Используйте вентилятор или настройте кондиционер\n🪟 Откройте окна для естественного охлаждения\n🛏️ Выберите дышащие, легкие постельные принадлежности\n🌡️ Рассмотрите охлаждающий наматрасник",
      isUser: false,
      type: 'recommendation'
    },
    {
      text: "Я также часто просыпаюсь ночью. Это нормально?",
      isUser: true,
      type: 'text'
    },
    {
      text: "Некоторые краткие пробуждения нормальны, но частые нарушения могут влиять на качество сна. Я заметила, что у вас было 3-4 эпизода пробуждения за ночь в последнее время. Это может быть связано с:\n\n💧 Поздним употреблением жидкости\n☕ Кофеином после 14:00\n📱 Воздействием света от устройств\n🧠 Стрессом или беспокойными мыслями",
      isUser: false,
      type: 'insight'
    },
    {
      text: "Вы правы насчет кофеина! Обычно пью кофе около 16:00. Стоит ли полностью от него отказаться?",
      isUser: true,
      type: 'text'
    },
    {
      text: "Вам не нужно полностью исключать кофеин! Просто скорректируйте время. Попробуйте заменить кофе в 16:00 на:\n\n🌅 Утренний кофе (6-10 утра)\n🍃 Травяной чай днем\n💧 Больше воды в течение дня\n\nКофеин имеет период полувыведения 6-8 часов, поэтому употребление после 14:00 может повлиять на сон.",
      isUser: false,
      type: 'recommendation'
    },
    {
      text: "Это потрясающе! Как вы так много узнаете о моих паттернах сна?",
      isUser: true,
      type: 'text'
    },
    {
      text: "Я непрерывно анализирую данные из вашего трекера сна, ежедневных привычек и наших разговоров для создания полного понимания вашего здоровья сна. Чем больше мы общаемся, тем лучше я предоставляю персонализированные рекомендации! 🤖💤",
      isUser: false,
      type: 'insight'
    },
    {
      text: "Можете помочь и с утренней рутиной?",
      isUser: true,
      type: 'text'
    },
    {
      text: "Конечно! Утренняя рутина так же важна, как и вечерняя. Вижу, что вы обычно просыпаетесь около 7 утра. Давайте оптимизируем ваши утра для лучшей энергии:",
      isUser: false,
      type: 'text'
    },
    {
      text: "☀️ Получайте солнечный свет в течение 30 минут после пробуждения\n🚿 Попробуйте прохладный душ для бодрости\n💧 Пейте воду перед кофе\n🧘 5-минутная медитация или растяжка",
      isUser: false,
      type: 'recommendation'
    },
    {
      text: "Утром я чувствую себя очень сонным. Есть советы?",
      isUser: true,
      type: 'text'
    },
    {
      text: "Утренняя сонливость часто указывает на недосып или нерегулярный график сна. По вашим данным, вы спите в среднем 6.5 часов - стремитесь к 7-8 часам стабильно.",
      isUser: false,
      type: 'insight'
    },
    {
      text: "А как насчет выходных? Люблю поспать подольше...",
      isUser: true,
      type: 'text'
    },
    {
      text: "Понимаю соблазн! Однако сон дольше обычного времени более чем на час может нарушить циркадный ритм. Попробуйте постепенные корректировки по 15 минут.",
      isUser: false,
      type: 'recommendation'
    },
    {
      text: "Это так логично! Как вы отслеживаете все это?",
      isUser: true,
      type: 'text'
    },
    {
      text: "Я интегрируюсь с данными здоровья устройства, датчиками сна и нашими разговорами для создания полной картины. Приватность важна - все остается на вашем устройстве! 🔒",
      isUser: false,
      type: 'insight'
    },
    {
      text: "Можете напоминать мне о вечерней рутине?",
      isUser: true,
      type: 'text'
    },
    {
      text: "Конечно! Я могу отправлять мягкие напоминания за 30 минут до оптимального времени сна. Настроить на 22:30 исходя из ваших целей сна?",
      isUser: false,
      type: 'text'
    },
    {
      text: "Да, это было бы идеально!",
      isUser: true,
      type: 'text'
    },
    {
      text: "Отлично! Я настроила напоминание перед сном. Буду также отслеживать, как хорошо вы следуете рутине, и корректировать рекомендации на основе того, что работает лучше для вас. Сладких снов! 🌙✨",
      isUser: false,
      type: 'insight'
    }
  ]
};

export const TIMING_CONFIG: TimingConfig = {
  baseDelay: {
    text: 3500,        // 3.5 секунды между сообщениями пользователя
    insight: 4000,     // 4 секунды между инсайтами AI
    recommendation: 4500 // 4.5 секунды между рекомендациями AI
  },
  typingSpeed: 50, // ms per character (медленнее для более реалистичной печати)
  minTypingTime: 2000,  // минимум 2 секунды печати
  maxTypingTime: 5000,  // максимум 5 секунд печати
  postInsightDelay: 1500 // дополнительная пауза после инсайтов
};

export const TRANSLATIONS = {
  en: {
    meetLuna: "Meet Luna",
    aiSleepAssistant: "Your AI Sleep Assistant",
    description: "Luna uses advanced AI to understand your sleep patterns, provide personalized insights, and help you achieve better rest.",
    chatPreview: "Chat Preview",
    whatLunaCanDo: "What Luna Can Do",
    sleepAnalysis: "Sleep Analysis",
    sleepAnalysisDesc: "Detailed insights into your sleep quality, patterns, and trends",
    smartSuggestions: "Smart Suggestions", 
    smartSuggestionsDesc: "Personalized recommendations to improve your sleep habits",
    goalTracking: "Goal Tracking",
    goalTrackingDesc: "Monitor progress toward your sleep goals with gentle guidance",
    support247: "24/7 Support",
    support247Desc: "Ask questions anytime and get helpful, understanding responses",
    privacyFirstAI: "Privacy-First AI",
    privacyDesc: "Luna processes your data locally and securely. Your sleep information stays on your device, and conversations are never stored or shared.",
    continueToLuna: "Continue to Luna",
    actionNote: "Start your AI-powered sleep journey"
  },
  ru: {
    meetLuna: "Знакомьтесь, Луна",
    aiSleepAssistant: "Ваш ИИ-помощник по сну",
    description: "Луна использует передовой ИИ для понимания паттернов вашего сна, предоставления персонализированных рекомендаций и достижения лучшего отдыха.",
    chatPreview: "Превью чата",
    whatLunaCanDo: "Что умеет Луна",
    sleepAnalysis: "Анализ сна",
    sleepAnalysisDesc: "Подробная информация о качестве сна, паттернах и трендах",
    smartSuggestions: "Умные советы",
    smartSuggestionsDesc: "Персональные рекомендации для улучшения привычек сна",
    goalTracking: "Отслеживание целей",
    goalTrackingDesc: "Мониторинг прогресса к целям сна с деликатным руководством",
    support247: "Поддержка 24/7",
    support247Desc: "Задавайте вопросы в любое время и получайте полезные, понимающие ответы",
    privacyFirstAI: "ИИ с приоритетом приватности",
    privacyDesc: "Луна обрабатывает ваши данные локально и безопасно. Информация о сне остается на устройстве, разговоры никогда не сохраняются и не передаются.",
    continueToLuna: "Продолжить с Луной", 
    actionNote: "Начните свое путешествие к лучшему сну с ИИ"
  }
};