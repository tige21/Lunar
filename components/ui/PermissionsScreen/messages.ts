import { PermissionsScreenMessages } from './types';

export const permissionsMessages: Record<'en' | 'ru', PermissionsScreenMessages> = {
  en: {
    header: {
      title: 'Health Data Access',
      subtitle: 'Connect your health data to get personalized sleep insights and automatic tracking.'
    },
    privacy: {
      title: 'Your Privacy is Protected',
      points: {
        localData: 'All health data stays on your device',
        noCloud: 'No data is sent to cloud servers',
        userControl: 'You control what data to share',
        revokable: 'Can be revoked at any time'
      }
    },
    permissions: {
      statusTitle: 'Current Permissions:',
      types: {
        sleep: 'Sleep Data',
        heartRate: 'Heart Rate',
        steps: 'Steps',
        workout: 'Workouts'
      }
    },
    benefits: {
      title: "What You'll Get:",
      smartInsights: {
        title: 'Smart Insights',
        description: 'AI-powered sleep analysis'
      },
      autoTracking: {
        title: 'Auto Tracking',
        description: 'Effortless sleep monitoring'
      }
    },
    actions: {
      grantAccess: 'Grant Access',
      requesting: 'Requesting Access...',
      continueWithout: 'Continue without health data'
    },
    alerts: {
      permissionsGranted: {
        title: 'Permissions Granted',
        message: 'Great! We can now access your health data to provide better sleep insights.',
        continue: 'Continue'
      },
      partialPermissions: {
        title: 'Partial Permissions',
        message: 'Some permissions were not granted. You can still use the app with manual tracking.',
        continue: 'Continue',
        tryAgain: 'Try Again'
      },
      continueWithout: {
        title: 'Continue Without Health Data?',
        message: "You can still track your sleep manually, but you'll miss out on automatic insights and correlations.",
        goBack: 'Go Back',
        continue: 'Continue'
      },
      unsupportedPlatform: {
        title: 'Health Data Not Available',
        android: 'Health data integration will be available in the next update. You can continue with manual tracking.',
        iosSimulator: 'HealthKit is not available on iOS Simulator. Please test on a physical device or continue with manual tracking.',
        iosDevice: 'HealthKit is not available on this device. You can continue with manual sleep tracking.',
        web: 'Health data integration is only available on mobile devices. You can continue with manual sleep tracking.',
        continue: 'Continue'
      },
      permissionError: {
        title: 'Permission Error',
        message: 'There was an issue accessing health data. You can continue with manual tracking or try again.',
        tryAgain: 'Try Again',
        continueAnyway: 'Continue Anyway',
        skip: 'Skip'
      }
    }
  },
  ru: {
    header: {
      title: 'Доступ к данным о здоровье',
      subtitle: 'Подключите данные о здоровье для получения персонализированных инсайтов о сне и автоматического отслеживания.'
    },
    privacy: {
      title: 'Ваша конфиденциальность защищена',
      points: {
        localData: 'Все данные о здоровье остаются на вашем устройстве',
        noCloud: 'Данные не отправляются на облачные серверы',
        userControl: 'Вы контролируете, какими данными делиться',
        revokable: 'Можно отозвать в любое время'
      }
    },
    permissions: {
      statusTitle: 'Текущие разрешения:',
      types: {
        sleep: 'Данные о сне',
        heartRate: 'Пульс',
        steps: 'Шаги',
        workout: 'Тренировки'
      }
    },
    benefits: {
      title: 'Что вы получите:',
      smartInsights: {
        title: 'Умные инсайты',
        description: 'ИИ-анализ сна'
      },
      autoTracking: {
        title: 'Автоотслеживание',
        description: 'Легкий мониторинг сна'
      }
    },
    actions: {
      grantAccess: 'Предоставить доступ',
      requesting: 'Запрашиваем доступ...',
      continueWithout: 'Продолжить без данных о здоровье'
    },
    alerts: {
      permissionsGranted: {
        title: 'Разрешения предоставлены',
        message: 'Отлично! Теперь мы можем получить доступ к вашим данным о здоровье для лучших инсайтов о сне.',
        continue: 'Продолжить'
      },
      partialPermissions: {
        title: 'Частичные разрешения',
        message: 'Некоторые разрешения не были предоставлены. Вы все еще можете использовать приложение с ручным отслеживанием.',
        continue: 'Продолжить',
        tryAgain: 'Попробовать снова'
      },
      continueWithout: {
        title: 'Продолжить без данных о здоровье?',
        message: 'Вы все еще можете отслеживать сон вручную, но упустите автоматические инсайты и корреляции.',
        goBack: 'Назад',
        continue: 'Продолжить'
      },
      unsupportedPlatform: {
        title: 'Данные о здоровье недоступны',
        android: 'Интеграция с данными о здоровье будет доступна в следующем обновлении. Вы можете продолжить с ручным отслеживанием.',
        iosSimulator: 'HealthKit недоступен в симуляторе iOS. Пожалуйста, протестируйте на физическом устройстве или продолжите с ручным отслеживанием.',
        iosDevice: 'HealthKit недоступен на этом устройстве. Вы можете продолжить с ручным отслеживанием сна.',
        web: 'Интеграция с данными о здоровье доступна только на мобильных устройствах. Вы можете продолжить с ручным отслеживанием сна.',
        continue: 'Продолжить'
      },
      permissionError: {
        title: 'Ошибка разрешений',
        message: 'Возникла проблема с доступом к данным о здоровье. Вы можете продолжить с ручным отслеживанием или попробовать снова.',
        tryAgain: 'Попробовать снова',
        continueAnyway: 'Все равно продолжить',
        skip: 'Пропустить'
      }
    }
  }
};