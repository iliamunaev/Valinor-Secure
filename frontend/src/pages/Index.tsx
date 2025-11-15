import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to /websites as the default page
    navigate('/websites', { replace: true });
  }, [navigate]);

  return null;
}