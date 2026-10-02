import { Links, Meta, Outlet, Scripts } from 'react-router';
import './app.css';

export default function App() {
  return (
    <html lang="nb">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
