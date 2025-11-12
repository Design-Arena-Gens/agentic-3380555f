export const metadata = {
  title: 'Comment Box',
  description: 'Simple social media comment box',
};

import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
