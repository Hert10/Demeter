import BaseLayout from '../baseLayout';
import { protect } from '../../utils/auth-utils';
import ClientComponentsWrapper from '../dswrapper';

export default async function Dashboard() {
  const { user } = await protect();

  return (
    <BaseLayout isAuthenticated={true} username={user.username}>
      <div className="container mt-4">
        <h1 className="text-center display-1"> Location Dashboard</h1>
        <ClientComponentsWrapper userId={user.id} />
      </div>
    </BaseLayout>
  );
}