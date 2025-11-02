import CopyBlock from '@/app/components/CopyBlock.jsx';

export const metadata = { title: 'Contribute — OptiPlay' };

export default function ContributePage(){
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Contribute</h1>
        <p className="text-sm text-gray-300 mt-2">If OptiPlay helps you, consider supporting the project. Every contribution helps keep the tools, guides, and news feeds improving.</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-purple-300">PayPal</h2>
        <a href="https://paypal.me/colxinnn" target="_blank" rel="noreferrer" className="inline-block px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 text-sm">Open PayPal.me/colxinnn</a>
        <div className="text-xs text-gray-500">PayPal handles cards and most regions.</div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-purple-300">Crypto</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <div className="text-sm text-gray-300 mb-1">Bitcoin (BTC)</div>
            <CopyBlock label="Copy BTC" code={`bc1qjhna4hm9lh5q9tg6xqaursspdzkfsplhf330eu`} />
          </div>
          <div>
            <div className="text-sm text-gray-300 mb-1">Ethereum (ETH)</div>
            <CopyBlock label="Copy ETH" code={`0x0A2d1CbbA5090dF459f03AEF1907267D081e4376`} />
          </div>
          <div>
            <div className="text-sm text-gray-300 mb-1">Litecoin (LTC)</div>
            <CopyBlock label="Copy LTC" code={`Lbhe3jbTcAdmLfpAjqinTv1ayo6n3j6MCU`} />
          </div>
        </div>
        <div className="text-xs text-gray-500">Send only the correct coin type to each address.</div>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-purple-300">Thank you</h2>
        <p className="text-sm text-gray-300">Your support helps fund hosting, build new features, and keep content fresh.</p>
      </section>
    </div>
  );
}

