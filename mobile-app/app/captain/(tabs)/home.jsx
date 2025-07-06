import { View } from 'react-native';
import CaptainMap from '../../../components/captain/custom/maps';
import RideRequestPopup from '../../../components/captain/custom/RideRequestPopup';


export default function CaptainHome() {
  return (
    <View className="flex-1">
     <CaptainMap />
     <RideRequestPopup/>
    </View>
  );
}
