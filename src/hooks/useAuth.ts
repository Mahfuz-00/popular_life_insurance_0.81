import { useSelector } from 'react-redux';
import type { RootState } from '../store';

export default function useAuth() {
  const { user, isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  return { user, isAuthenticated, token };
}