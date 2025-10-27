import CopyBlock from '@/app/components/CopyBlock.jsx';

export default function Page(){
  return (
    <div className='max-w-3xl mx-auto px-4 py-8 space-y-8'>
      <header className='space-y-2'>
        <h1 className='text-2xl font-bold'>Low-Latency Windows Setup</h1>
        <div className='text-xs text-gray-400'>Guide updated 12 April 2025</div>
        <p className='text-slate-300'>Optimize Windows 10/11 for the best gaming latency without breaking core features. Safe, reversible steps with links to the official tools.</p>
        <div className='text-xs text-yellow-300/90'>Before you start: Create a System Restore Point (type "restore point" in Start and click Create).</div>
      </header>

      <section className='space-y-2'>
        <h2 className='text-lg font-semibold text-purple-300'>Recommended Windows build</h2>
        <p className='text-sm text-gray-300'>For fresh installs, Windows 11 LTSC has almost no bloat by default. This guide still helps on Home/Pro SKUs.</p>
      </section>

      <section className='space-y-3'>
        <h2 className='text-lg font-semibold text-purple-300'>Tools you’ll need</h2>
        <ul className='list-disc pl-5 text-sm text-gray-300 space-y-1'>
          <li><a className='underline hover:no-underline' href='https://www.wagnardsoft.com/software' target='_blank' rel='noreferrer'>Display Driver Uninstaller (DDU)</a> — cleanly remove GPU drivers.</li>
          <li><a className='underline hover:no-underline' href='https://www.techpowerup.com/download/techpowerup-nvcleanstall/' target='_blank' rel='noreferrer'>NVCleanstall</a> — install NVIDIA drivers without telemetry/bloat.</li>
          <li>Optional: Chris Titus Utility for safe debloat & tweaks (PowerShell Admin):</li>
        </ul>
        <CopyBlock code={`iwr -useb https://christitus.com/win | iex`} />
        <div className='text-xs text-gray-500'>You can revert changes in each tool or by using your restore point.</div>
      </section>

      <section className='space-y-3'>
        <h2 className='text-lg font-semibold text-purple-300'>Step 1 — Uninstall GPU drivers (DDU)</h2>
        <ol className='list-decimal pl-5 text-sm text-gray-200 space-y-2'>
          <li>Download DDU from Wagnardsoft and run the self-extracting archive. Choose a folder like <code>C:\\Users\\You\\Desktop</code> then click <b>Extract</b>.</li>
          <li>Open the extracted folder and launch <b>Display Driver Uninstaller.exe</b>.</li>
          <li>Set <b>Device type</b> to <b>GPU</b> and <b>Vendor</b> to <b>NVIDIA</b> (or AMD/Intel as appropriate).</li>
          <li>Click <b>Clean and restart (Highly recommended)</b>. Wait for Windows to reboot.</li>
        </ol>
        <div className='text-xs text-gray-500'>DDU in Safe Mode is ideal, but normal mode also works in most cases.</div>
      </section>

      <section className='space-y-3'>
        <h2 className='text-lg font-semibold text-purple-300'>Step 2 — Install clean NVIDIA drivers (NVCleanstall)</h2>
        <ol className='list-decimal pl-5 text-sm text-gray-200 space-y-2'>
          <li>Open NVCleanstall. Select <b>Install best driver for my hardware</b>, then Next.</li>
          <li>Let it download/prepare sources.</li>
          <li>On <b>Installation Tweaks</b>, enable:
            <ul className='list-disc pl-5 mt-1 space-y-1 text-gray-300'>
              <li><b>Disable Installer Telemetry & Advertising</b></li>
              <li><b>Perform a Clean Installation</b></li>
              <li><b>Install NVIDIA Control Panel App</b> from Microsoft Store (no Microsoft account required)</li>
            </ul>
          </li>
          <li>Click Next and complete the installation. Reboot when prompted.</li>
        </ol>
        <div className='text-xs text-gray-500'>If you need GeForce Experience for recording, enable ShadowPlay; otherwise keep it off to minimize background processes.</div>
      </section>

      <section className='space-y-3'>
        <h2 className='text-lg font-semibold text-purple-300'>AMD/Intel notes</h2>
        <p className='text-sm text-gray-300'>For AMD/Intel GPUs, use DDU as above, then install the latest official drivers from the vendor website. Skip NVCleanstall.</p>
      </section>

      <section className='space-y-3'>
        <h2 className='text-lg font-semibold text-purple-300'>Optional — Debloat safely (Chris Titus Utility)</h2>
        <p className='text-sm text-gray-300'>Open PowerShell as Administrator, run the one‑liner above, then:</p>
        <ul className='list-disc pl-5 text-sm text-gray-300 space-y-1'>
          <li>Go to <b>Tweaks</b> → choose <b>Essential Tweaks</b> (Desktop or Laptop) after reading descriptions.</li>
          <li>Be cautious with <b>Advanced Tweaks</b>: don’t block Adobe if you need it; avoid “Set display to performance”; don’t remove all Store apps.</li>
          <li>Click <b>Run Tweaks</b> and wait for completion.</li>
        </ul>
      </section>

      <section className='space-y-2'>
        <h2 className='text-lg font-semibold text-purple-300'>Done — Verify</h2>
        <ul className='list-disc pl-5 text-sm text-gray-300 space-y-1'>
          <li>NVIDIA Control Panel opens and shows your GPU/driver version.</li>
          <li>No GeForce Experience/telemetry services if you didn’t select them.</li>
          <li>Games launch without stutters from background driver tasks.</li>
        </ul>
      </section>

      <footer className='space-y-2'>
        <h3 className='font-semibold'>Support the project</h3>
        <div className='grid sm:grid-cols-2 gap-2 text-sm'>
          <CopyBlock label='Copy BTC' code={`bc1qjhna4hm9lh5q9tg6xqaursspdzkfsplhf330eu`} />
          <CopyBlock label='Copy ETH' code={`0x0A2d1CbbA5090dF459f03AEF1907267D081e4376`} />
          <CopyBlock label='Copy LTC' code={`Lbhe3jbTcAdmLfpAjqinTv1ayo6n3j6MCU`} />
        </div>
        <a href='https://paypal.me/colxinnn' className='inline-block mt-2 px-3 py-1 rounded bg-purple-700 hover:bg-purple-600 text-sm' target='_blank' rel='noreferrer'>PayPal</a>
      </footer>
    </div>
  )}
