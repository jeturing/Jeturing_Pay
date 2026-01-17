import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'OnboardingWelcome'>;

const { width, height } = Dimensions.get('window');

export default function OnboardingWelcomeScreen({ navigation }: Props) {
  const handleSkip = () => {
    navigation.navigate('ConnectAccount');
  };

  const handleNext = () => {
    navigation.navigate('OnboardingCardEntry');
  };

  return (
    <View style={styles.container}>
      {/* Gradient Background Circles */}
      <View style={styles.gradientCircle1} />
      <View style={styles.gradientCircle2} />
      <View style={styles.decorativeBox1} />
      <View style={styles.decorativeBox2} />
      
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip &gt;</Text>
      </TouchableOpacity>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Logo and Brand */}
        <View style={styles.brandContainer}>
          <MaterialCommunityIcons name="contactless-payment" size={48} color="#5A67D8" />
          <Text style={styles.brandText}>Jeturing</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Card entry</Text>

        {/* Description */}
        <Text style={styles.description}>
          Get paid on the go! Simply type in card details no matter where you are. 
          No monthly or terminal fees here. Sign up in five minutes and receive 
          payouts within 2 days.
        </Text>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        <View style={styles.navigationRow}>
          {/* Progress Dots */}
          <View style={styles.dotsContainer}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>

          {/* Next Button */}
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <MaterialCommunityIcons name="arrow-right" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Powered By */}
        <View style={styles.poweredByContainer}>
          <View style={styles.poweredByBadge}>
            <Text style={styles.poweredByText}>
              Integrado con <Text style={styles.poweredByBold}>Jeturing CORE</Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
    padding: 32,
  },
  gradientCircle1: {
    position: 'absolute',
    top: -height * 0.25,
    right: -width * 0.25,
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: 'rgba(90, 103, 216, 0.1)',
  },
  gradientCircle2: {
    position: 'absolute',
    bottom: -height * 0.25,
    left: -width * 0.25,
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: 'rgba(90, 103, 216, 0.1)',
  },
  decorativeBox1: {
    position: 'absolute',
    top: height * 0.1,
    left: width * 0.05,
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: 'rgba(90, 103, 216, 0.05)',
    transform: [{ rotate: '-45deg' }],
  },
  decorativeBox2: {
    position: 'absolute',
    bottom: height * 0.2,
    right: width * 0.1,
    width: 128,
    height: 128,
    borderRadius: 16,
    backgroundColor: 'rgba(90, 103, 216, 0.05)',
    transform: [{ rotate: '-45deg' }],
  },
  skipButton: {
    position: 'absolute',
    top: 32,
    right: 32,
    zIndex: 10,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5A67D8',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
    marginLeft: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
    paddingHorizontal: 16,
  },
  bottomContainer: {
    paddingBottom: 16,
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  dotActive: {
    width: 16,
    backgroundColor: '#0F172A',
  },
  nextButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  poweredByContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  poweredByBadge: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  poweredByText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  poweredByBold: {
    fontWeight: '600',
    color: '#475569',
  },
});
