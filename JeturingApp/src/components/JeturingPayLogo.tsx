import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G, Circle } from 'react-native-svg';

interface LogoProps {
  size?: number;
  color?: string;
}

export const JeturingPayLogo: React.FC<LogoProps> = ({ 
  size = 100, 
  color = '#00A896' 
}) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        {/* Círculo principal */}
        <Circle
          cx="100"
          cy="100"
          r="80"
          stroke={color}
          strokeWidth="8"
          fill="none"
        />
        
        {/* Línea decorativa superior */}
        <Path
          d="M65,40 Q70,35 85,50"
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Tarjeta de crédito */}
        <G transform="translate(70, 85)">
          {/* Rectángulo de la tarjeta */}
          <Path
            d="M0,0 L60,0 Q65,0 65,5 L65,30 Q65,35 60,35 L0,35 Q-5,35 -5,30 L-5,5 Q-5,0 0,0 Z"
            fill="#E8F5F3"
            stroke="#0080A8"
            strokeWidth="2"
          />
          
          {/* Banda magnética */}
          <Path
            d="M-5,10 L65,10 L65,18 L-5,18 Z"
            fill="#0080A8"
          />
          
          {/* Chip */}
          <Path
            d="M5,22 L18,22 L18,30 L5,30 Z"
            fill="#FFD700"
            stroke="#0080A8"
            strokeWidth="1"
          />
          
          {/* Líneas de texto */}
          <Path
            d="M25,24 L50,24"
            stroke="#0080A8"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <Path
            d="M25,29 L45,29"
            stroke="#0080A8"
            strokeWidth="2"
            strokeLinecap="round"
          />
          
          {/* Flecha de pago */}
          <Path
            d="M70,15 L85,15 M80,10 L85,15 L80,20"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
        
        {/* Línea decorativa inferior */}
        <Path
          d="M65,160 Q100,170 135,160"
          stroke="#0080A8"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default JeturingPayLogo;
