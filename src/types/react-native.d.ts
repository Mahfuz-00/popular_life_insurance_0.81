declare module 'radio-buttons-react-native' {
  import { Component } from 'react';
  import { StyleProp, TextStyle, ViewStyle } from 'react-native';

  export interface RadioButtonItem {
    label: string;
    value: any;
  }

  export interface RadioButtonRNProps {
    data: RadioButtonItem[];
    selectedBtn?: (item: RadioButtonItem) => void;
    box?: boolean;
    circleSize?: number;
    activeColor?: string;
    deactiveColor?: string;
    boxActiveBgColor?: string;
    boxDeactiveBgColor?: string;
    textStyle?: StyleProp<TextStyle>;
    style?: StyleProp<ViewStyle>;
    animationTypes?: ('zoomIn' | 'zoomOut' | 'pulse' | 'shake')[];
    duration?: number;
    initial?: number;
    textColor?: string;
    box?: boolean;
    boxStyle?: StyleProp<ViewStyle>;
    icon?: React.ReactNode;
    formHorizontal?: boolean;
    labelHorizontal?: boolean;
  }

  class RadioButtonRN extends Component<RadioButtonRNProps> {}
  export default RadioButtonRN;
}