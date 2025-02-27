"use client";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Header({ session }: { session: Session | null }) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  return (
    <header className="border-b p-4 flex items-center justify-between">
      <Link className="text-blue-600 font-bold text-2xl " href="/">
        PMAKET
      </Link>
      <nav className="flex gap-4 *:border *:rounded *:px-2 *:py-1">
        <Link
          href="/new"
          className="border border-blue-600 text-blue-600 inline-flex gap-1 items-center py-1 px-4 mr-4"
        >
          <FontAwesomeIcon icon={faPlus} className="h-4" />
          <span>Post a ad</span>
        </Link>
        {!session?.user && ( // trạng thái chưa đăng nhập
          <>
            <button className="border-0 text-gray-600">sign up</button>
            <button
              onClick={() => signIn("google")}
              className="bg-blue-600 text-white border-0 px-6 py-1"
            >
              login
            </button>
          </>
        )}
        {session?.user && ( // sau khi đăng nhập
          <>
            <div className="relative flex items-center">
              <button onClick={() => setShowDropdown((prev) => !prev)}>
                <Image
                  src={session.user.image as string}
                  alt={"avatar"}
                  width={36}
                  height={36}
                  className={
                    "rounded-md relative " + (showDropdown ? "z-50" : "")
                  }
                />
              </button>
              {showDropdown && ( // menu tuỳ chọn
                <>
                  <div
                    onClick={() => setShowDropdown(false)}
                    className="bg-black/90 fixed inset-0 z-40"
                  ></div>
                  <div className="absolute z-50 right-0 top-9 bg-white rounded-md w-24 border">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        router.push("/my-ads");
                      }}
                      className="p-2 block text-center w-full"
                    >
                      My ads
                    </button>
                    <button
                      className="p-2 block w-full"
                      onClick={() => signOut()}
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </nav>
    </header>
  );
}
