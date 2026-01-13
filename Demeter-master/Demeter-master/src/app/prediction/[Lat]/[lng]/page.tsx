import { protect } from '../../../../utils/auth-utils';
import Prediction_Page from './prediction_client';

export default async function PredictionPage() {
  const { user } = await protect(); 
  return <Prediction_Page user={user} />;
}
