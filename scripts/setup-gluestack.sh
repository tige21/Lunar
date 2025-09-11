#!/bin/bash

# Lunar Sleep App - Gluestack UI v2 Setup Script
# This script installs and configures Gluestack UI v2 with sleep-focused theming

echo "🌙 Setting up Gluestack UI v2 for Lunar Sleep App..."

# Install Gluestack UI v2 dependencies
echo "📦 Installing Gluestack UI v2 dependencies..."
npm install @gluestack-ui/nativewind-utils@^1.0.25 @gluestack-ui/themed@^1.1.55

# Ensure NativeWind is properly installed
echo "🎨 Updating NativeWind..."
npm install nativewind@^4.0.1

# Install additional fonts (Inter family for better readability)
echo "🔤 Setting up fonts..."
# Note: You'll need to manually add Inter font files to assets/fonts/
echo "  ⚠️  Remember to add Inter font files to assets/fonts/:"
echo "     - Inter-Regular.ttf"
echo "     - Inter-Medium.ttf" 
echo "     - Inter-SemiBold.ttf"
echo "     - Inter-Bold.ttf"

# Run pod install for iOS
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "🍎 Running pod install for iOS..."
  npx pod-install
fi

echo "✅ Gluestack UI v2 setup complete!"
echo ""
echo "🚀 Next steps:"
echo "1. Add Inter font files to assets/fonts/ directory"
echo "2. Run 'npm start' to start the development server"
echo "3. Test the theme system with the SleepDashboardExample component"
echo ""
echo "💡 The sleep-focused theme includes:"
echo "   - Deep purple primary colors for night mode comfort"
echo "   - Warm orange accents for sunrise/wake elements"
echo "   - Sleep stage specific color coding"
echo "   - Optimized typography for health data display"
echo ""
echo "🌙 Sweet dreams are made of good code! 😴"