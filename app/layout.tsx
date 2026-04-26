import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PM Sidekick — AI copilot for every kind of PM',
  description: 'Describe what you\'re building in plain English. Get back market research, a flow diagram, and JIRA-ready artifacts. No templates. No methodology knowledge required.',
  openGraph: {
    title: 'PM Sidekick',
    description: 'The AI copilot for every kind of PM.',
    url: 'https://pmsidekick.vercel.app',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
