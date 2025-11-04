"use client";

import { useMemo, useState } from "react";
import { signOut } from "next-auth/react";

function passwordStatus(password) {
  if (password.length < 8) {
    return { className: "text-red-400", message: "Too short — minimum 8 characters." };
  }
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  if (!hasNumber && !hasSpecial) {
    return { className: "text-yellow-400", message: "Add a number or special character for better strength." };
  }
  if (password.length >= 12 && hasUpper && (hasNumber || hasSpecial)) {
    return { className: "text-green-400 font-semibold", message: "Perfect! This password is rock solid." };
  }
  return { className: "text-yellow-300", message: "Good password. Longer is even better." };
}

export default function ProfileClient({ user }) {
  const [username, setUsername] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarData, setAvatarData] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(user?.image || "");
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const passwordInfo = useMemo(() => passwordStatus(password), [password]);
  const passwordValid =
    password.length >= 8 &&
    (/[\d]/.test(password) || /[^A-Za-z0-9]/.test(password)) &&
    password === passwordConfirm;

  function handleAvatarChange(e) {
    setProfileError("");
    const file = e.target.files?.[0];
    if (!file) {
      setAvatarData("");
      setRemoveAvatar(false);
      return;
    }
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setProfileError("Only PNG and JPEG files are allowed.");
      e.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileError("Avatar must be smaller than 2MB.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setAvatarData(result);
      setAvatarPreview(result);
      setRemoveAvatar(false);
    };
    reader.readAsDataURL(file);
  }

  function clearAvatar() {
    setAvatarData("");
    setAvatarPreview("");
    setRemoveAvatar(true);
  }

  async function saveProfile(e) {
    e.preventDefault();
    setProfileError("");
    setProfileMessage("");
    setSavingProfile(true);
    try {
      if (username.length < 3 || username.length > 16) {
        throw new Error("Username must be between 3 and 16 characters.");
      }
      if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
        throw new Error("Username can only contain letters, numbers, underscores, or dots.");
      }
      if (bio.length > 500) {
        throw new Error("Bio must be 500 characters or fewer.");
      }

      const res = await fetch("/api/account/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          bio,
          avatarData,
          removeAvatar,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error || "Unable to update profile.");
      }
      setProfileMessage("Profile updated.");
      if (removeAvatar) {
        setAvatarPreview("");
      }
    } catch (err) {
      setProfileError(err.message || String(err));
    } finally {
      setSavingProfile(false);
      setRemoveAvatar(false);
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    setPasswordError("");
    setPasswordMessage("");
    if (!passwordValid) return;
    setSavingPassword(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.message || payload.error || "Unable to update password.");
      }
      setPasswordMessage("Password updated successfully.");
      setPassword("");
      setPasswordConfirm("");
    } catch (err) {
      setPasswordError(err.message || String(err));
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 lg:flex-row">
      <section className="flex-1 space-y-6 rounded-2xl border border-white/10 bg-neutral-900/60 p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Profile</h1>
            <p className="text-sm text-gray-300">
              Signed in as <span className="font-mono text-purple-200">{user?.email}</span>
            </p>
            {username ? (
              <p className="text-xs text-purple-200/70">
                Public page: optiplay.space/profile/{username}
              </p>
            ) : null}
          </div>
          <div className="ml-4">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="rounded-md border border-white/10 bg-neutral-800 px-3 py-1 text-sm text-gray-200 hover:bg-neutral-700"
            >
              Sign out
            </button>
          </div>
        </div>
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-purple-100">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white shadow-inner focus:border-purple-400 focus:outline-none"
              placeholder="OptiChampion"
            />
            <p className="text-xs text-gray-400">
              Between 3 and 16 characters. Letters, numbers, underscores, and dots are allowed.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-purple-100">Avatar</label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full border border-white/10 bg-black/40">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-purple-200/40">
                    No image
                  </div>
                )}
              </div>
              <div className="space-y-2 text-sm text-gray-300">
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleAvatarChange}
                  className="text-xs text-gray-300 file:mr-3 file:rounded-md file:border-0 file:bg-purple-600 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-white hover:file:bg-purple-500"
                />
                <button
                  type="button"
                  onClick={clearAvatar}
                  className="block text-xs text-purple-200/70 underline hover:text-purple-100"
                >
                  Remove avatar
                </button>
                <p className="text-xs text-gray-400">PNG or JPEG, up to 2MB.</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-purple-100">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={4}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white shadow-inner focus:border-purple-400 focus:outline-none"
              placeholder="Tell the community a little about yourself (500 characters max)."
            />
            <p className="text-xs text-gray-400">{bio.length}/500 characters</p>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="w-full rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
          >
            {savingProfile ? "Saving..." : "Save profile"}
          </button>
          {profileMessage ? <p className="text-sm text-green-400">{profileMessage}</p> : null}
          {profileError ? <p className="text-sm text-red-400">{profileError}</p> : null}
        </form>
      </section>

      <section className="flex-1 space-y-6 rounded-2xl border border-white/10 bg-neutral-900/60 p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-white">Update password</h2>
        <form onSubmit={savePassword} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-purple-100">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white shadow-inner focus:border-purple-400 focus:outline-none"
              placeholder="Choose something strong"
            />
            {password ? (
              <p className={`text-xs ${passwordInfo.className}`}>{passwordInfo.message}</p>
            ) : (
              <p className="text-xs text-gray-400">
                Minimum 8 characters. Add numbers, symbols, and uppercase letters for extra strength.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm text-purple-100">Confirm password</label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white shadow-inner focus:border-purple-400 focus:outline-none"
              placeholder="Re-enter your password"
            />
            {password && password !== passwordConfirm ? (
              <p className="text-xs text-red-400">Passwords must match exactly.</p>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={!passwordValid || savingPassword}
            className="w-full rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
          >
            {savingPassword ? "Updating..." : "Save password"}
          </button>
          {passwordMessage ? <p className="text-sm text-green-400">{passwordMessage}</p> : null}
          {passwordError ? <p className="text-sm text-red-400">{passwordError}</p> : null}
        </form>
      </section>
    </div>
  );
}
