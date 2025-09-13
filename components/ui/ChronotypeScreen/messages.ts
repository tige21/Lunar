import { ChronotypeMessages } from './types';

export const messages: Record<'en' | 'ru', ChronotypeMessages> = {
  en: {
    progress: {
      questionCounter: "Question {current} of {total}"
    },
    questions: [
      {
        id: 1,
        question: "When do you naturally feel most alert and energetic?",
        options: [
          { text: "Early morning (6-9 AM)", value: -2, emoji: "🌅" },
          { text: "Late morning (9-12 PM)", value: -1, emoji: "☀️" },
          { text: "Afternoon (12-6 PM)", value: 0, emoji: "🏃‍♀️" },
          { text: "Evening (6-10 PM)", value: 1, emoji: "🌆" },
          { text: "Late evening (after 10 PM)", value: 2, emoji: "🌙" },
        ]
      },
      {
        id: 2,
        question: "If you had no commitments, what time would you naturally go to bed?",
        options: [
          { text: "Before 10 PM", value: -2, emoji: "😴" },
          { text: "10 PM - 11 PM", value: -1, emoji: "🛌" },
          { text: "11 PM - 12 AM", value: 0, emoji: "💤" },
          { text: "12 AM - 1 AM", value: 1, emoji: "🌃" },
          { text: "After 1 AM", value: 2, emoji: "🦉" },
        ]
      },
      {
        id: 3,
        question: "What time would you naturally wake up without an alarm?",
        options: [
          { text: "Before 6 AM", value: -2, emoji: "🐓" },
          { text: "6 AM - 7 AM", value: -1, emoji: "🌅" },
          { text: "7 AM - 8 AM", value: 0, emoji: "☀️" },
          { text: "8 AM - 10 AM", value: 1, emoji: "😊" },
          { text: "After 10 AM", value: 2, emoji: "😴" },
        ]
      },
      {
        id: 4,
        question: "When do you prefer to exercise?",
        options: [
          { text: "Early morning", value: -2, emoji: "🏃‍♂️" },
          { text: "Late morning", value: -1, emoji: "🚴‍♀️" },
          { text: "Afternoon", value: 0, emoji: "⚽" },
          { text: "Early evening", value: 1, emoji: "🏋️‍♀️" },
          { text: "Late evening", value: 2, emoji: "🌙" },
        ]
      },
      {
        id: 5,
        question: "When is your appetite strongest?",
        options: [
          { text: "Right after waking up", value: -2, emoji: "🥞" },
          { text: "Mid-morning", value: -1, emoji: "🥯" },
          { text: "Lunch time", value: 0, emoji: "🥗" },
          { text: "Dinner time", value: 1, emoji: "🍽️" },
          { text: "Late evening/night", value: 2, emoji: "🍕" },
        ]
      },
      {
        id: 6,
        question: "How do you feel immediately after waking up?",
        options: [
          { text: "Fully alert and ready", value: -2, emoji: "⚡" },
          { text: "Fairly alert", value: -1, emoji: "😊" },
          { text: "Neither alert nor tired", value: 0, emoji: "😐" },
          { text: "A little tired", value: 1, emoji: "😴" },
          { text: "Very tired", value: 2, emoji: "🥱" },
        ]
      },
      {
        id: 7,
        question: "At what time do you feel tired and ready for sleep?",
        options: [
          { text: "8 PM - 9 PM", value: -2, emoji: "😴" },
          { text: "9 PM - 10:15 PM", value: -1, emoji: "💤" },
          { text: "10:15 PM - 12:45 AM", value: 0, emoji: "🛌" },
          { text: "12:45 AM - 2 AM", value: 1, emoji: "🌃" },
          { text: "After 2 AM", value: 2, emoji: "🦉" },
        ]
      }
    ],
    results: {
      types: {
        morning: {
          title: "Morning Person",
          description: "You're a definite Morning Person! You naturally wake up early and feel most energetic in the first half of the day.",
          recommendations: [
            "Try to get sunlight exposure within 30 minutes of waking",
            "Schedule important tasks for morning hours",
            "Aim for bedtime between 9-10 PM for optimal rest",
            "Avoid caffeine after 2 PM to support early sleep"
          ]
        },
        evening: {
          title: "Evening Person",
          description: "You're a definite Evening Person! You feel more alert and productive during the later hours of the day.",
          recommendations: [
            "Try to get bright light exposure in the evening",
            "Schedule demanding tasks for afternoon/evening",
            "Create a consistent bedtime routine even if it's later",
            "Consider blackout curtains for better morning sleep"
          ]
        },
        neither: {
          title: "Flexible Sleeper",
          description: "You're somewhere in between! You have a flexible sleep schedule and can adapt to different routines.",
          recommendations: [
            "Maintain consistent sleep and wake times",
            "Adjust your schedule based on daily demands",
            "Pay attention to your body's natural signals",
            "Use light exposure to shift your rhythm when needed"
          ]
        }
      },
      recommendationsTitle: "Personalized Sleep Tips",
      continueButton: "Continue"
    }
  },
  ru: {
    progress: {
      questionCounter: "Вопрос {current} из {total}"
    },
    questions: [
      {
        id: 1,
        question: "Когда вы естественно чувствуете себя наиболее бодрым и энергичным?",
        options: [
          { text: "Рано утром (6-9 утра)", value: -2, emoji: "🌅" },
          { text: "Поздно утром (9-12 дня)", value: -1, emoji: "☀️" },
          { text: "После обеда (12-18 часов)", value: 0, emoji: "🏃‍♀️" },
          { text: "Вечером (18-22 часа)", value: 1, emoji: "🌆" },
          { text: "Поздно вечером (после 22)", value: 2, emoji: "🌙" },
        ]
      },
      {
        id: 2,
        question: "Если бы у вас не было обязательств, во сколько бы вы естественно ложились спать?",
        options: [
          { text: "До 22:00", value: -2, emoji: "😴" },
          { text: "22:00 - 23:00", value: -1, emoji: "🛌" },
          { text: "23:00 - 00:00", value: 0, emoji: "💤" },
          { text: "00:00 - 01:00", value: 1, emoji: "🌃" },
          { text: "После 01:00", value: 2, emoji: "🦉" },
        ]
      },
      {
        id: 3,
        question: "Во сколько вы бы естественно просыпались без будильника?",
        options: [
          { text: "До 6:00", value: -2, emoji: "🐓" },
          { text: "6:00 - 7:00", value: -1, emoji: "🌅" },
          { text: "7:00 - 8:00", value: 0, emoji: "☀️" },
          { text: "8:00 - 10:00", value: 1, emoji: "😊" },
          { text: "После 10:00", value: 2, emoji: "😴" },
        ]
      },
      {
        id: 4,
        question: "Когда вы предпочитаете заниматься спортом?",
        options: [
          { text: "Рано утром", value: -2, emoji: "🏃‍♂️" },
          { text: "Поздно утром", value: -1, emoji: "🚴‍♀️" },
          { text: "После обеда", value: 0, emoji: "⚽" },
          { text: "Ранним вечером", value: 1, emoji: "🏋️‍♀️" },
          { text: "Поздним вечером", value: 2, emoji: "🌙" },
        ]
      },
      {
        id: 5,
        question: "Когда ваш аппетит наиболее сильный?",
        options: [
          { text: "Сразу после пробуждения", value: -2, emoji: "🥞" },
          { text: "В середине утра", value: -1, emoji: "🥯" },
          { text: "В обеденное время", value: 0, emoji: "🥗" },
          { text: "Во время ужина", value: 1, emoji: "🍽️" },
          { text: "Поздним вечером/ночью", value: 2, emoji: "🍕" },
        ]
      },
      {
        id: 6,
        question: "Как вы себя чувствуете сразу после пробуждения?",
        options: [
          { text: "Полностью бодр и готов", value: -2, emoji: "⚡" },
          { text: "Довольно бодр", value: -1, emoji: "😊" },
          { text: "Ни бодр, ни усталый", value: 0, emoji: "😐" },
          { text: "Немного устал", value: 1, emoji: "😴" },
          { text: "Очень устал", value: 2, emoji: "🥱" },
        ]
      },
      {
        id: 7,
        question: "В какое время вы чувствуете усталость и готовы ко сну?",
        options: [
          { text: "20:00 - 21:00", value: -2, emoji: "😴" },
          { text: "21:00 - 22:15", value: -1, emoji: "💤" },
          { text: "22:15 - 00:45", value: 0, emoji: "🛌" },
          { text: "00:45 - 02:00", value: 1, emoji: "🌃" },
          { text: "После 02:00", value: 2, emoji: "🦉" },
        ]
      }
    ],
    results: {
      types: {
        morning: {
          title: "Жаворонок",
          description: "Вы определенно жаворонок! Вы естественно просыпаетесь рано и чувствуете себя наиболее энергично в первой половине дня.",
          recommendations: [
            "Получайте солнечный свет в течение 30 минут после пробуждения",
            "Планируйте важные дела на утренние часы",
            "Ложитесь спать между 21-22 часами для оптимального отдыха",
            "Избегайте кофеина после 14:00 для поддержки раннего сна"
          ]
        },
        evening: {
          title: "Сова",
          description: "Вы определенно сова! Вы чувствуете себя более бодрым и продуктивным в поздние часы дня.",
          recommendations: [
            "Получайте яркий свет вечером",
            "Планируйте сложные задачи на вторую половину дня/вечер",
            "Создайте постоянный ритуал отхода ко сну, даже если он поздний",
            "Рассмотрите затемняющие шторы для лучшего утреннего сна"
          ]
        },
        neither: {
          title: "Гибкий режим",
          description: "Вы находитесь где-то посередине! У вас гибкий график сна, и вы можете адаптироваться к разным режимам.",
          recommendations: [
            "Поддерживайте постоянное время сна и пробуждения",
            "Корректируйте свой режим в зависимости от ежедневных потребностей",
            "Обращайте внимание на естественные сигналы вашего тела",
            "Используйте освещение для изменения ритма при необходимости"
          ]
        }
      },
      recommendationsTitle: "Персональные советы по сну",
      continueButton: "Продолжить"
    }
  }
};