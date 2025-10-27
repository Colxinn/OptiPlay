import CopyBlock from '@/app/components/CopyBlock.jsx';

export default function Page() {
  return (
    <div className='max-w-3xl mx-auto px-4 py-8 space-y-8'>
      <header>
        <h1 className='text-2xl font-bold'>FPS Booster</h1>
        <p className='text-slate-300 mt-2'>A curated set of tweaks to reduce bloat, unlock performance plans, and tune system priorities. Read carefully and proceed at your own risk.</p>
        <div className='mt-3 text-xs text-yellow-300/90'>Tip: Create a System Restore Point before making registry or power settings changes.</div>
      </header>

      <section className='space-y-3'>
        <h2 className='text-lg font-semibold text-purple-300'>Chris Titus Tech Utility (Debloat / Tweak)</h2>
        <p className='text-sm text-gray-300'>Launch PowerShell as Administrator and run the following one‑liner to open the interactive utility. Choose sensible debloat and tweaks. Avoid removing features you use.</p>
        <CopyBlock code={`iwr -useb https://christitus.com/win | iex`} />
      </section>

      <section className='space-y-3'>
        <h2 className='text-lg font-semibold text-purple-300'>Step‑by‑Step: Debloat with DBLOW Utility</h2>
        <p className='text-sm text-gray-300'>These steps summarize the walkthrough from the referenced video. The tool is interactive and safe when you read each option. You can revert many tweaks later.</p>
        <ol className='list-decimal pl-5 text-sm text-gray-200 space-y-1'>
          <li>Open <span className='font-semibold'>PowerShell (Admin)</span>.</li>
          <li>Paste the command below and press Enter to launch the utility.</li>
        </ol>
        <CopyBlock code={`iwr -useb https://christitus.com/win | iex`} />
        <ol start={3} className='list-decimal pl-5 text-sm text-gray-200 space-y-1'>
          <li>When the window opens, go to the <span className='font-semibold'>Tweaks</span> tab.</li>
          <li>Under <span className='font-semibold'>Essential Tweaks</span>, choose <span className='font-semibold'>Desktop</span> or <span className='font-semibold'>Laptop</span> based on your device. Hover each item to read its description.</li>
          <li>Under <span className='font-semibold'>Advanced Tweaks</span>, be cautious and avoid the following unless you are sure:
            <ul className='list-disc pl-5 mt-1 space-y-1 text-gray-300'>
              <li><span className='font-semibold'>Block Adobe Network</span> — skip this if you use Adobe websites or cloud features.</li>
              <li><span className='font-semibold'>Set display to performance</span> — can degrade visual quality noticeably.</li>
              <li><span className='font-semibold'>Remove all Microsoft Store apps</span> — can remove useful tools (e.g., Snipping Tool) you may rely on.</li>
            </ul>
          </li>
          <li>Click <span className='font-semibold'>Run Tweaks</span>. Wait a few minutes until the confirmation indicates it’s finished.</li>
        </ol>
        <div className='text-xs text-gray-500'>Reference video: <a href='https://www.youtube.com/watch?v=Ntkc6PeImhU' target='_blank' rel='noreferrer' className='underline hover:no-underline'>YouTube walkthrough</a></div>
      </section>

      <section className='space-y-3'>
        <h2 className='text-lg font-semibold text-purple-300'>Enable Ultimate Performance Power Plan</h2>
        <p className='text-sm text-gray-300'>Adds the hidden “Ultimate Performance” plan (desktop only on some SKUs). Run in an elevated Command Prompt or PowerShell.</p>
        <CopyBlock code={`powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61`} />
        <p className='text-xs text-gray-400'>After running, open Power Options → Show additional plans → select <b>Ultimate Performance</b>.</p>
      </section>

      <section className='space-y-3'>
        <h2 className='text-lg font-semibold text-purple-300'>Priority Tweaks (Registry Locations)</h2>
        <p className='text-sm text-gray-300'>You can review and adjust these keys to bias foreground games and reduce multimedia throttling. Change values only if you know what they do.</p>
        <CopyBlock label='Copy Path' code={`Computer\\HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games`} />
        <CopyBlock label='Copy Path' code={`Computer\\HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\PriorityControl`} />
        <CopyBlock label='Copy Path' code={`Computer\\HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile`} />
        <div className='text-xs text-gray-400'>Common values people tweak:
          <ul className='list-disc pl-5 mt-1 space-y-1'>
            <li><span className='font-semibold'>Win32PrioritySeparation</span> (PriorityControl): favors foreground responsiveness vs. background throughput.</li>
            <li><span className='font-semibold'>SystemResponsiveness</span> (SystemProfile): lower values can prioritize gaming over background tasks.</li>
            <li><span className='font-semibold'>NetworkThrottlingIndex</span> (SystemProfile): set to <code>ffffffff</code> to disable throttling (hex).</li>
          </ul>
        </div>
      </section>

      <section className='space-y-3'>
        <h2 className='text-lg font-semibold text-purple-300'>How to Undo</h2>
        <ul className='text-sm text-gray-300 list-disc pl-5 space-y-1'>
          <li>Use System Restore to revert a restore point.</li>
          <li>Switch your Power Plan back to Balanced in Power Options.</li>
          <li>In the Titus utility, re-run and choose the <em>revert</em> options where available.</li>
          <li>For registry edits, export keys before changing them so you can import to restore.</li>
        </ul>
      </section>
    </div>
  );
}
