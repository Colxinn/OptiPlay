import Link from 'next/link';
import DailyTip from './DailyTip.jsx';
import DailyPoll from './DailyPoll.jsx';
import SponsorApplicationCard from './SponsorApplicationCard.jsx';

export default function LeftSidebar(){
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-[#0b0b10] border border-white/10 p-4">
        <div className="font-semibold mb-2">Gamer Toolbox</div>
        <ul className="text-sm text-gray-300 space-y-2">
          <li><Link href="/news" className="hover:underline">Latest Esports News</Link></li>
          <li><Link href="/tools/windows-gamemode" className="hover:underline">Optimize My PC</Link></li>
          <li><Link href="/tools" className="hover:underline">Gaming Tools</Link></li>
          <li><Link href="/forum" className="hover:underline">Community & Forums</Link></li>
        </ul>
      </div>
      <DailyPoll />
      <DailyTip />
      <SponsorApplicationCard />
    </div>
  );
}
