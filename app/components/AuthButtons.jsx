'use client';
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function AuthButtons({ session }) {
  if (session?.user) {
    // show avatar + name and a small dropdown menu containing Profile + Sign out
    return <ProfileMenu user={session.user} />;
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/auth/signin"
        className="rounded-lg bg-purple-600 px-3 py-1 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300/60"
      >
        Sign in with Email
      </Link>
    </div>
  );
}

function ProfileMenu({ user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function onDoc(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((s) => !s)}
        className="flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-white/3 transition"
        aria-expanded={open}
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div className="h-8 w-8 rounded-full bg-neutral-800" />
        )}
        <span className={`text-sm ${user.isOwner ? 'owner-text font-semibold' : 'text-gray-300'}`}>
          {user.name || 'Gamer'}{user.isOwner ? ' • Owner' : ''}
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-44 rounded bg-neutral-900 border border-white/10 shadow-lg py-1 z-40">
          <Link href="/profile" className="block px-3 py-2 text-sm text-gray-200 hover:bg-white/5">Profile</Link>
          <button onClick={() => signOut()} className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-white/5">Sign out</button>
        </div>
      ) : null}
    </div>
  );
}
