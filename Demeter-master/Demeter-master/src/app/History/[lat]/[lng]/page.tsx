import { protect } from '../../../../utils/auth-utils';
import History from './history_client';

export default async function PredictionPage() {
  const { user } = await protect(); 
  return <History user={user} />;
}
