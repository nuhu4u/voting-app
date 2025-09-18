import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to homepage instead of login/dashboard
  return <Redirect href="/homepage" />;
}
