// import { StyleSheet } from 'react-native';

// import ParallaxScrollView from '@/components/ParallaxScrollView';
// import { ThemedText } from '@/components/ThemedText';
// import { ThemedView } from '@/components/ThemedView';
// import { IconSymbol } from '@/components/ui/IconSymbol';

// export default function ImproveScreen() {
//   return (
//     <ParallaxScrollView
//       headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
//       headerImage={
//         <IconSymbol
//           size={310}
//           color="#808080"
//           name="star.fill"
//           style={styles.headerImage}
//         />
//       }>
//       <ThemedView style={styles.titleContainer}>
//         <ThemedText type="title">Sleep Improvement</ThemedText>
//       </ThemedView>
//       <ThemedText>
//         Personalized recommendations and tools to improve your sleep quality.
//       </ThemedText>
//       <ThemedView style={styles.stepContainer}>
//         <ThemedText type="subtitle">Features Coming Soon</ThemedText>
//         <ThemedText>
//           • Sleep hygiene recommendations{'\n'}
//           • Bedtime routine suggestions{'\n'}
//           • Environment optimization tips{'\n'}
//           • Habit tracking and goals{'\n'}
//           • Progress monitoring
//         </ThemedText>
//       </ThemedView>
//     </ParallaxScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   headerImage: {
//     color: '#808080',
//     bottom: -90,
//     left: -35,
//     position: 'absolute',
//   },
//   titleContainer: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   stepContainer: {
//     gap: 8,
//     marginBottom: 8,
//   },
// });