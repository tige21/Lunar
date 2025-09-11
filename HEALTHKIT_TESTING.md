# HealthKit Testing Guide

## Обновленная интеграция HealthKit завершена! 🎉

Теперь приложение Lunar **полностью интегрировано** с Apple HealthKit для получения реальных данных о сне.

## Что было исправлено:

### ✅ **Активная интеграция**
- Автоматический запрос разрешений при загрузке данных
- Детальное логирование всех этапов синхронизации
- Принудительная очистка кеша для тестирования

### ✅ **Видимые компоненты**
- Индикатор HealthKit статуса в дашборде (компактный)
- HealthKit настройки в Settings с полным интерфейсом
- Экран onboarding для подключения HealthKit
- Debug экран для тестирования (Settings → Developer Tools → HealthKit Test)

### ✅ **Улучшенное логирование**
Все действия логируются с эмодзи:
- 🔄 Начало синхронизации
- 🔐 Проверка разрешений  
- 💤 Получение данных сна
- ❤️ Получение данных пульса
- ✅ Успешное завершение
- ❌ Ошибки с подробностями

## Как протестировать:

### 1. **Быстрое тестирование в дашборде**
1. Откройте главный экран приложения
2. В development mode появится оранжевая кнопка "🧪 Force HealthKit Sync"
3. Нажмите её и проверьте консоль

### 2. **Полное тестирование через Debug экран**
1. Перейдите в Settings → Developer Tools → "🧪 HealthKit Test"
2. Используйте пошаговые кнопки тестирования
3. Проверяйте логи в самом экране и консоли

### 3. **Настройки HealthKit**
1. Перейдите в Settings → Health Integration
2. Используйте интерфейс для подключения/отключения
3. Проверьте статус синхронизации

### 4. **Обработка обновления данных**
- Каждое обновление дашборда очищает кеш
- Pull-to-refresh принудительно запрашивает новые данные
- Компактный индикатор HealthKit показывает актуальный статус

## Ожидаемое поведение:

### 🟢 **При наличии данных в Apple Health:**
```
🚀 Dashboard: Starting to load sleep data
🗑️ Dashboard: Cleared sleep data cache
🔄 Starting HealthKit sync for 1 days
🔐 HealthKit authorization status: sharingAuthorized
📅 Fetching HealthKit data from [date] to [date]
💤 Found X sleep records
❤️ Found X heart rate records
📊 Found X HRV records
✅ Successfully transformed HealthKit data
💤 Dashboard: Sleep score: XX
```

### 🟡 **При отсутствии разрешений:**
```
🔄 Starting HealthKit sync for 1 days
🔐 HealthKit authorization status: notDetermined
⚠️ HealthKit not authorized, trying to request permissions
✅ HealthKit permissions granted
[далее как выше]
```

### 🟠 **При отсутствии данных:**
```
🔄 Starting HealthKit sync for 1 days
🔐 HealthKit authorization status: sharingAuthorized
💤 Found 0 sleep records
⚠️ No HealthKit sleep data found, using mock data
```

### 🔴 **На Android или при недоступности:**
```
❌ HealthKit not available on this device, using mock data
```

## Важные заметки:

1. **Требуется iOS устройство** - HealthKit доступен только на iOS
2. **Нужны данные в Apple Health** - используйте приложение "Сон" или Apple Watch
3. **Консоль разработчика** - все логи видны в Metro/Expo консоли
4. **Кеш очищается** - при каждом обновлении дашборда для получения свежих данных

## Файлы для проверки:

- **lib/services/sleepService.ts** - основная логика синхронизации
- **lib/adapters/healthKitAdapter.ts** - адаптер HealthKit API
- **components/ui/HealthSyncStatus.tsx** - UI индикатор
- **app/debug/healthkit-test.tsx** - экран тестирования
- **app/(tabs)/settings.tsx** - настройки интеграции

Теперь приложение должно **автоматически получать реальные данные** из Apple Health! 🚀