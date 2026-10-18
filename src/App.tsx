import { useEffect, useState } from 'react';
import { Landing } from './components/Landing';
import { Workspace } from './components/Workspace';
import { byId } from './registry';

/** Hash routing: #stack, #bst, … deep-link straight into a workspace. */
function routeFromHash(): string | null {
  const id = window.location.hash.replace('#', '');
  return byId(id) ? id : null;
}

export default function App() {
  const [route, setRoute] = useState<string | null>(routeFromHash);

  useEffect(() => {
    const onHash = () => setRoute(routeFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const open = (id: string | null) => {
    window.location.hash = id ?? '';
    setRoute(id);
  };

  const module = route ? byId(route) : undefined;
  return module ? (
    // key remounts the workspace on switch, so no state or timer leaks across structures
    <Workspace key={module.id} module={module} onNavigate={open} />
  ) : (
    <Landing onOpen={open} />
  );
}
