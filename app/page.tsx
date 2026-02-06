import Dashboard from '@/components/Dashboard';

export const metadata = {
  title: 'FollowPulse - Live Instagram Follower Tracker',
  description: 'Track your Instagram followers in real-time with FollowPulse',
};

export default function Home() {
  return (
    <main>
      <Dashboard initialUsername="therajeshchityal" />
    </main>
  );
}
