import './globals.css';

export const metadata = {
  title: 'Deux Toits — l\'organisation de la garde alternée, sans friction',
  description: 'Calendrier de garde, dépenses partagées et journal, réunis dans un espace neutre pour les parents séparés.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
