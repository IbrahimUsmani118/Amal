declare module 'react-native-qibla-compass' {
  export interface QiblaCompassHook {
    qiblad: number;
    compassDirection: string;
    compassDegree: number;
    compassRotate: number;
    kabaRotate: number;
    error: string;
    isLoading: boolean;
    reinitCompass: () => void;
  }

  export interface QiblaCompassProps {
    color?: string;
    backgroundColor?: string;
    textStyles?: any;
    kaabaImage?: any;
    compassImage?: any;
  }

  export function useQiblaCompass(): QiblaCompassHook;
  
  const QiblaCompass: React.ComponentType<QiblaCompassProps>;
  export default QiblaCompass;
}
