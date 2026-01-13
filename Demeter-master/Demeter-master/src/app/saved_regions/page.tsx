import { protect } from '../../utils/auth-utils';
import SavedRegionsClient from './savedregionsclient';

export default async function SavedRegionsPage() {
  const { user } = await protect(); 
  return <SavedRegionsClient user={user} />;
}
