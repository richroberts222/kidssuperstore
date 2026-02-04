import { Link } from 'react-router-dom';
import { Button, Card } from '../components/ui';

export function NotFoundPage() {
  return (
    <Card>
      <h2>Lost in the neighborhood</h2>
      <p className="muted">That page isn’t on this street.</p>
      <Link to="/shop">
        <Button>Go to shop</Button>
      </Link>
    </Card>
  );
}
