import './globals.css';

export const metadata = {
  title: 'Gross Profit Calculator | Pricing & Profitability Tool',
  description: 'Calculate gross profit per transaction with itemized costs (commission, manufacturing, shipping). Includes break-even analysis and pricing optimization with fixed cost tracking.',
  keywords: 'gross profit, pricing calculator, break-even analysis, profitability, unit economics, commission, manufacturing cost, CQuence Health',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta property="og:title" content="Gross Margin Calculator | Pricing & Profitability Tool" />
        <meta property="og:description" content="Calculate gross margins, break-even points, and optimize pricing with fixed cost analysis. A comprehensive tool for understanding unit economics and profitability." />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="CQuence Health" />
        <meta property="og:image" content="/opengraph-image.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="CQuence Health Gross Margin Calculator" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Gross Margin Calculator | Pricing & Profitability Tool" />
        <meta name="twitter:description" content="Calculate gross margins, break-even points, and optimize pricing with fixed cost analysis." />
        <meta name="twitter:image" content="/opengraph-image.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
